
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the currency symbol for a given currency code.
 * Defaults to '$' for USD or unknown codes.
 */
export function getCurrencySymbol(currencyCode: string = 'USD') {
  const symbols: Record<string, string> = {
    AED: "د.إ", AFN: "؋", ALL: "L", AMD: "֏", ANG: "ƒ", AOA: "Kz", ARS: "$", AUD: "A$", AWG: "ƒ", AZN: "₼",
    BAM: "KM", BBD: "$", BDT: "৳", BGN: "лв", BHD: ".د.ب", BIF: "FBu", BMD: "$", BND: "$", BOB: "Bs.", BRL: "R$",
    BSD: "$", BTN: "Nu.", BWP: "P", BYN: "Br", BZD: "$", CAD: "C$", CDF: "FC", CHF: "CHF", CLP: "$", CNY: "¥",
    COP: "$", CRC: "₡", CUP: "$", CVE: "$", CZK: "Kč", DJF: "Fdj", DKK: "kr", DOP: "$", DZD: "د.ج", EGP: "£",
    ERN: "Nfk", ETB: "Br", EUR: "€", FJD: "$", FKP: "£", GBP: "£", GEL: "₾", GHS: "₵", GIP: "£", GMD: "D",
    GNF: "FG", GTQ: "Q", GYD: "$", HKD: "HK$", HNL: "L", HRK: "kn", HTG: "G", HUF: "Ft", IDR: "Rp", ILS: "₪",
    INR: "₹", IQD: "ع.د", IRR: "﷼", ISK: "kr", JMD: "$", JOD: "د.ا", JPY: "¥", KES: "KSh", KGS: "лв", KHR: "៛",
    KMF: "CF", KPW: "₩", KRW: "₩", KWD: "د.ك", KYD: "$", KZT: "₸", LAK: "₭", LBP: "ل.ل", LKR: "₨", LRD: "$",
    LSL: "L", LYD: "ل.د", MAD: "د.م.", MDL: "L", MGA: "Ar", MKD: "den", MMK: "K", MNT: "₮", MOP: "P", MRU: "UM",
    MUR: "₨", MVR: "Rf", MWK: "MK", MXN: "$", MYR: "RM", MZN: "MT", NAD: "$", NGN: "₦", NIO: "C$", NOK: "kr",
    NPR: "₨", NZD: "NZ$", OMR: "﷼", PAB: "B/.", PEN: "S/.", PGK: "K", PHP: "₱", PKR: "₨", PLN: "zł", PYG: "₲",
    QAR: "﷼", RON: "lei", RSD: "din", RUB: "₽", RWF: "FRw", SAR: "ر.س", SBD: "$", SCR: "₨", SDG: "£", SEK: "kr",
    SGD: "S$", SHP: "£", SLL: "Le", SOS: "Sh", SRD: "$", SSP: "£", STN: "Db", SYP: "£", SZL: "L", THB: "฿",
    TJS: "SM", TMT: "m", TND: "د.ت", TOP: "T$", TRY: "₺", TTD: "$", TWD: "NT$", TZS: "Sh", UAH: "₴", UGX: "USh",
    USD: "$", UYU: "$", UZS: "лв", VES: "Bs.S", VND: "₫", VUV: "Vt", WST: "T", XAF: "FCFA", XCD: "$", XOF: "CFA",
    XPF: "₣", YER: "﷼", ZAR: "R", ZMW: "ZK", ZWL: "$"
  };
  return symbols[currencyCode] || '$';
}
