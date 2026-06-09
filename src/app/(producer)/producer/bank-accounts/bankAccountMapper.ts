import { BankAccountType } from './types';

export interface BankFormData {
  banco: string;
  tipoCuenta: string;
  cbu: string;
  alias: string;
  titular: string;
  cuit: string;
}

export interface ApiBankAccount {
  bankName: string;
  accountType: BankAccountType;
  accountNumber: string;
  holderName: string;
  holderDocument: string;
}

const ACCOUNT_TYPE_TO_LABEL: Record<BankAccountType, string> = {
  SAVINGS: 'Caja de Ahorros',
  CHECKING: 'Cuenta Corriente',
};

const LABEL_TO_ACCOUNT_TYPE: Record<string, BankAccountType> = {
  'Caja de Ahorros': BankAccountType.SAVINGS,
  'Cuenta Corriente': BankAccountType.CHECKING,
};

export function mapApiToForm(account: ApiBankAccount): BankFormData {
  return {
    banco: account.bankName,
    tipoCuenta: ACCOUNT_TYPE_TO_LABEL[account.accountType] ?? 'Caja de Ahorros',
    cbu: account.accountNumber,
    alias: '',
    titular: account.holderName,
    cuit: account.holderDocument,
  };
}

export function mapFormToApi(form: BankFormData): ApiBankAccount {
  return {
    bankName: form.banco.trim(),
    accountType:
      LABEL_TO_ACCOUNT_TYPE[form.tipoCuenta] ?? BankAccountType.SAVINGS,
    accountNumber: form.cbu.trim(),
    holderName: form.titular.trim(),
    holderDocument: form.cuit.trim(),
  };
}
