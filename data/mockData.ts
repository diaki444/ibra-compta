
import { Transaction, Invoice, UserProfile } from '../types';

export const mockTransactions: Transaction[] = [
  { id: 'T1', type: 'revenue', source: 'Uber', amountExVat: 120.50, vatRate: 6, totalAmount: 127.73, vatAmount: 7.23, date: '2024-07-15', paymentMethod: 'Bank Transfer' },
  { id: 'T2', type: 'revenue', source: 'Bolt', amountExVat: 85.00, vatRate: 6, totalAmount: 90.10, vatAmount: 5.10, date: '2024-07-16', paymentMethod: 'Bank Transfer' },
  { id: 'T3', type: 'expense', source: 'Carburant - TotalEnergies', amountExVat: 50.00, vatRate: 21, totalAmount: 60.50, vatAmount: 10.50, date: '2024-07-17', paymentMethod: 'Card', status: 'Payé' },
  { id: 'T4', type: 'revenue', source: 'Freelance Project', amountExVat: 500.00, vatRate: 21, totalAmount: 605.00, vatAmount: 105.00, date: '2024-07-18', paymentMethod: 'Bank Transfer' },
  { id: 'T5', type: 'expense', source: 'Abonnement Téléphone', amountExVat: 25.00, vatRate: 21, totalAmount: 30.25, vatAmount: 5.25, date: '2024-07-20', paymentMethod: 'Bank Transfer', status: 'Payé' },
  { id: 'T6', type: 'expense', source: 'Entretien voiture', amountExVat: 150.00, vatRate: 21, totalAmount: 181.50, vatAmount: 31.50, date: '2024-08-02', paymentMethod: 'Card', status: 'Non payé' },
  { id: 'T7', type: 'revenue', source: 'Uber', amountExVat: 150.75, vatRate: 6, totalAmount: 159.80, vatAmount: 9.05, date: '2024-08-05', paymentMethod: 'Bank Transfer' },
];

export const mockInvoices: Invoice[] = [
  { id: 'I1', invoiceNumber: 'INV-2024-0001', clientName: 'Client A', clientAddress: '123 Rue de Bruxelles, 1000 Bruxelles', clientVatNumber: 'BE 0987.654.321', serviceDescription: 'Web Development', amountExVat: 1500, vatRate: 21, totalAmount: 1815, issueDate: '2024-07-10', dueDate: '2024-07-25', status: 'Payée' },
  { id: 'I2', invoiceNumber: 'INV-2024-0002', clientName: 'Client B', clientAddress: '456 Avenue de Flandre, 9000 Gand', clientVatNumber: 'BE 0123.987.456', serviceDescription: 'Graphic Design', amountExVat: 750, vatRate: 21, totalAmount: 907.50, issueDate: '2024-07-20', dueDate: '2024-08-05', status: 'En attente' },
  { id: 'I3', invoiceNumber: 'INV-2024-0003', clientName: 'Client C', clientAddress: '789 Boulevard d\'Anvers, 2000 Anvers', clientVatNumber: 'BE 0456.123.789', serviceDescription: 'Consulting', amountExVat: 1200, vatRate: 21, totalAmount: 1452, issueDate: '2024-06-25', dueDate: '2024-07-10', status: 'Impayée' },
];

export const mockUserProfile: UserProfile = {
  name: "Ibrahim Diallo",
  companyName: "IBRA-COMPTA Services",
  vatNumber: "BE 0123.456.789",
  address: "123 Rue de l'Exemple, 1000 Bruxelles, Belgique",
  email: "ibrahim.diallo@example.com",
  phone: "+32 412 34 56 78",
  alertSettings: {
    lowBalance: { enabled: true, threshold: 500 },
    overdueInvoice: { enabled: true, days: 1 },
    upcomingInvoice: { enabled: true, days: 7 },
  },
};
