import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, setProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
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
        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-800 disabled:text-gray-400"
      />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Profil de l'entreprise</h3>
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Annuler
              </button>
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Sauvegarder
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
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
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Inviter votre comptable</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Donnez un accès en lecture seule à votre comptable pour qu'il puisse consulter vos données et rapports.
        </p>
        <form className="flex flex-col sm:flex-row gap-4" onSubmit={e => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email du comptable"
            className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Envoyer l'invitation
          </button>
        </form>
      </div>

       <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Paramètres des notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Activer les rappels par email pour les factures en retard</span>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-gray-300">Recevoir le résumé mensuel par email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
       </div>
    </div>
  );
};

export default Profile;
