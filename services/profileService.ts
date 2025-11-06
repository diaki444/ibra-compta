import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      name: data.name,
      companyName: data.company_name,
      vatNumber: data.vat_number,
      address: data.address,
      email: data.email,
      phone: data.phone,
      alertSettings: data.alert_settings,
    };
  },

  async createProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        name: profile.name || '',
        company_name: profile.companyName || '',
        vat_number: profile.vatNumber || '',
        address: profile.address || '',
        email: profile.email || '',
        phone: profile.phone || '',
        alert_settings: profile.alertSettings || {
          lowBalance: { enabled: true, threshold: 500 },
          overdueInvoice: { enabled: true, days: 1 },
          upcomingInvoice: { enabled: true, days: 7 },
        },
      });

    if (error) throw error;
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const updateData: any = {};

    if (profile.name !== undefined) updateData.name = profile.name;
    if (profile.companyName !== undefined) updateData.company_name = profile.companyName;
    if (profile.vatNumber !== undefined) updateData.vat_number = profile.vatNumber;
    if (profile.address !== undefined) updateData.address = profile.address;
    if (profile.email !== undefined) updateData.email = profile.email;
    if (profile.phone !== undefined) updateData.phone = profile.phone;
    if (profile.alertSettings !== undefined) updateData.alert_settings = profile.alertSettings;

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
  },
};
