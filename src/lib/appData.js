import { supabase } from "./supabase";

async function readTable(table, fallback) {
  if (!supabase) return fallback;
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`Unable to load ${table}; using demo data.`, error.message);
    return fallback;
  }
  return data?.length ? data : fallback;
}

function promotionFromRow(promotion) {
  return {
    id: promotion.promotion_id,
    title: promotion.promotion_title,
    desc: promotion.promotion_description,
    start: promotion.promotion_start_date,
    end: promotion.promotion_end_date,
    image: null,
    views: promotion.promotion_views || 0,
    clicks: promotion.promotion_clicks || 0,
    active: promotion.promotion_status === "active",
  };
}

function profileFromAppUser(user, tenant, store) {
  const role = user.user_role === "superadmin" ? "super_admin" : user.user_role;
  return {
    role,
    name: store?.store_name || tenant?.tenant_name || user.user_name,
    subtitle: role === "tenant" ? "Tenant Account" : role === "mall_admin" ? "Mall Admin" : "Super Admin",
    userId: user.user_auth_user_id,
    userName: user.user_name,
    userEmail: user.user_email,
    userGender: user.user_gender,
    userDob: user.user_dob,
    ...tenant,
    ...store,
    logo: role === "tenant" ? "/store-logo.png" : role === "mall_admin" ? "/mall-logo.png" : undefined,
  };
}

export async function loadAppData() {
  const [profiles, tenants, stores, promotionRows] = await Promise.all([
    readTable("app_user", []),
    readTable("tenant", []),
    readTable("store", []),
    readTable("promotion", []),
  ]);
  const promotions = promotionRows.map(promotionFromRow);
  const appProfiles = profiles.map((profile) => {
    if (!profile.user_role) return profile;
    const tenant = tenants.find((item) => String(item.tenant_id) === String(profile.user_id))
      || tenants.find((item) => String(item.store_id) === String(profile.user_id));
    const store = stores.find((item) => String(item.store_id) === String(tenant?.store_id));
    return profileFromAppUser(profile, tenant, store);
  });

  return {
    profiles: appProfiles.reduce((result, profile) => ({ ...result, [profile.role]: profile }), {}),
    promotions,
  };
}


export async function fetchPromotions(storeId) {
  if (!supabase || !storeId) return null;
  const { data, error } = await supabase
    .from("promotion")
    .select("*")
    .eq("store_id", storeId)
    .order("promotion_start_date", { ascending: false });
  if (error) throw error;
  return data.map(promotionFromRow);
}

export async function signIn(email, password) {
  const value = email.trim().toLowerCase();
  const demoRoles = { super: "super_admin", mall: "mall_admin", tenant: "tenant" };
  if (demoRoles[value]) return { role: demoRoles[value], demo: true, email: value };
  if (!supabase) return { role: "tenant" };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from("app_user")
    .select("user_role, user_name, user_auth_user_id")
    .eq("user_auth_user_id", data.user.id)
    .single();
  if (profileError) throw profileError;
  return { role: profileFromAppUser(profile).role, email: data.user.email };
}

export async function getCurrentSession() {
  const demoRole = localStorage.getItem("navar_demo_role");
  if (!supabase) return demoRole ? { role: demoRole, demo: true } : null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return demoRole ? { role: demoRole, demo: true } : null;

  const { data: profile, error: profileError } = await supabase
    .from("app_user")
    .select("user_role, user_auth_user_id")
    .eq("user_auth_user_id", data.session.user.id)
    .single();
  if (profileError) throw profileError;
  return { role: profileFromAppUser(profile).role, email: data.session.user.email };
}

export async function signOut() {
  localStorage.removeItem("navar_demo_role");
  if (supabase) await supabase.auth.signOut();
}

export async function updateTenantProfile(profile, values) {
  if (!supabase || profile?.demo) return;

  const { error: appUserError } = await supabase
    .from("app_user")
    .update({ user_name: values.accountName, user_email: values.accountEmail })
    .eq("user_auth_user_id", profile.userId);
  if (appUserError) throw appUserError;

  if (values.accountEmail !== profile.userEmail) {
    const { error: authError } = await supabase.auth.updateUser({ email: values.accountEmail });
    if (authError) throw authError;
  }

  const tenantQuery = supabase.from("tenant").update({
    tenant_contact_person: values.contactName,
    tenant_contact_num: values.contactPhone,
    tenant_email: values.contactEmail,
    tenant_updated_at: new Date().toISOString(),
  });
  const { error: tenantError } = await (profile.tenant_id
    ? tenantQuery.eq("tenant_id", profile.tenant_id)
    : tenantQuery.eq("store_id", profile.store_id));
  if (tenantError) throw tenantError;
}

export async function changePassword(email, currentPassword, newPassword, demo = false) {
  if (!supabase || demo) return;

  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (loginError) throw new Error("The current password is incorrect.");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}