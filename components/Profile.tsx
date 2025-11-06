import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import Card from './Card';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onDeleteAccount: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile, onDeleteAccount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [summaryEnabled, setSummaryEnabled] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAlertToggle = (key: 'lowBalance' | 'overdueInvoice' | 'upcomingInvoice') => {
    setFormData(prev => {
        const newSettings = { ...prev.alertSettings };
        newSettings[key].enabled = !newSettings[key].enabled;
        return { ...prev, alertSettings: newSettings };
    });
  };

  const handleAlertValueChange = (key: 'lowBalance' | 'overdueInvoice' | 'upcomingInvoice', subkey: 'threshold' | 'days', value: string) => {
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 0) return;
      
      setFormData(prev => {
          const newSettings = { ...prev.alertSettings };
          (newSettings[key] as any)[subkey] = numericValue;
          return { ...prev, alertSettings: newSettings };
      });
  };

  const handleSave = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        await profileService.updateProfile(user.id, formData);
        setProfile(formData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde du profil.');
    }
  };

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && inviteEmail.includes('@')) {
        alert(`Invitation envoyée à ${inviteEmail}.`);
        setInviteEmail('');
    } else {
        alert("Veuillez entrer une adresse email valide.");
    }
  };
  
  const handleDeleteAccount = () => {
    const confirmation = window.prompt("Cette action est irréversible et supprimera toutes vos données. Pour confirmer, veuillez taper 'SUPPRIMER' dans le champ ci-dessous.");
    if (confirmation === 'SUPPRIMER') {
        alert("Votre compte a été supprimé avec succès.");
        onDeleteAccount();
    } else {
        alert("La suppression du compte a été annulée.");
    }
  };

  const InputField = ({ label, name, value }: { label: string, name: keyof UserProfile, value: string }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-400">{label}</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={!isEditing}
        className="mt-1 block w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:bg-gray-700/50 disabled:text-gray-400"
      />
    </div>
  );
  
  const buttonStyle = "bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition";
  const toggleInputStyle = "w-full bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
  const ToggleSwitch: React.FC<{checked: boolean; onChange: () => void; disabled?: boolean}> = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" disabled={disabled} />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
    </label>
  );


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-white">Profil de l'entreprise</h3>
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="bg-gray-600 hover:bg-gray-500 text-gray-200 font-bold py-2 px-4 rounded-lg transition">
                Annuler
              </button>
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition">
                Sauvegarder
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className={buttonStyle}>
              Modifier
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Nom complet" name="name" value={formData.name} />
          <InputField label="Nom de l'entreprise" name="companyName" value={formData.companyName} />
          <InputField label="Numéro de TVA" name="vatNumber" value={formData.vatNumber} />
          <InputField label="Adresse" name="address" value={formData.address} />
          <InputField label="Email" name="email" value={formData.email} />
          <InputField label="Téléphone" name="phone" value={formData.phone} />
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-4">Invitez votre comptable</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Donnez un accès en lecture seule à votre comptable pour qu'il puisse consulter vos données et rapports.
        </p>
        <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSendInvitation}>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email du comptable"
            className="flex-grow bg-gray-700 border-gray-600 p-2 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
          <button type="submit" className={buttonStyle}>
            Envoyer l'invitation
          </button>
        </form>
      </Card>

       <Card>
          <h3 className="text-xl font-semibold text-white mb-4">Notifications par email (Simulation)</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-gray-300">Rappels pour les factures impayées</span>
               <ToggleSwitch checked={remindersEnabled} onChange={() => setRemindersEnabled(p => !p)} />
            </div>
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-gray-300">Résumé mensuel de votre activité</span>
              <ToggleSwitch checked={summaryEnabled} onChange={() => setSummaryEnabled(p => !p)} />
            </div>
          </div>
       </Card>

        <Card>
            <h3 className="text-xl font-semibold text-white mb-4">Alertes personnalisées</h3>
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-gray-300">Alerte de solde bancaire bas</span>
                        <ToggleSwitch checked={formData.alertSettings.lowBalance.enabled} onChange={() => handleAlertToggle('lowBalance')} disabled={!isEditing} />
                    </div>
                    {formData.alertSettings.lowBalance.enabled && (
                        <div className="pl-0 sm:pl-4 mt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Seuil de déclenchement (en €)</label>
                            <input
                                type="number"
                                value={formData.alertSettings.lowBalance.threshold}
                                onChange={(e) => handleAlertValueChange('lowBalance', 'threshold', e.target.value)}
                                className={toggleInputStyle} disabled={!isEditing}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-gray-300">Alerte d'échéance de facture</span>
                        <ToggleSwitch checked={formData.alertSettings.upcomingInvoice.enabled} onChange={() => handleAlertToggle('upcomingInvoice')} disabled={!isEditing} />
                    </div>
                    {formData.alertSettings.upcomingInvoice.enabled && (
                        <div className="pl-0 sm:pl-4 mt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Prévenir (jours avant l'échéance)</label>
                             <input
                                type="number"
                                value={formData.alertSettings.upcomingInvoice.days}
                                onChange={(e) => handleAlertValueChange('upcomingInvoice', 'days', e.target.value)}
                                className={toggleInputStyle} disabled={!isEditing}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-gray-300">Alerte pour facture impayée</span>
                        <ToggleSwitch checked={formData.alertSettings.overdueInvoice.enabled} onChange={() => handleAlertToggle('overdueInvoice')} disabled={!isEditing}/>
                    </div>
                    {formData.alertSettings.overdueInvoice.enabled && (
                        <div className="pl-0 sm:pl-4 mt-2">
                            <label className="text-sm text-gray-400 mb-1 block">Déclencher après (jours de retard)</label>
                             <input
                                type="number"
                                value={formData.alertSettings.overdueInvoice.days}
                                onChange={(e) => handleAlertValueChange('overdueInvoice', 'days', e.target.value)}
                                className={toggleInputStyle} disabled={!isEditing}
                            />
                        </div>
                    )}
                </div>
            </div>
            {isEditing && <p className="text-xs text-amber-400 mt-4 text-center">N'oubliez pas de sauvegarder vos changements.</p>}
        </Card>
        
        <Card className="border-red-700 bg-red-900/20">
            <h3 className="text-xl font-semibold text-red-400 mb-4">Zone de Danger</h3>
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                    <p className="text-gray-300 font-semibold">Supprimer le compte</p>
                    <p className="text-sm text-gray-400 mt-1">Cette action est irréversible. Toutes vos données (factures, transactions, etc.) seront définitivement perdues.</p>
                </div>
                <button 
                    onClick={handleDeleteAccount}
                    className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition whitespace-nowrap"
                >
                    Supprimer mon compte
                </button>
            </div>
        </Card>

    </div>
  );
};

export default Profile;
