
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Globe, Loader2, Save, Check, Search, ChevronDown, Cpu } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const CURRENCIES = [
  { code: "AED", label: "United Arab Emirates Dirham (د.إ)" },
  { code: "AFN", label: "Afghan Afghani (؋)" },
  { code: "ALL", label: "Albanian Lek (L)" },
  { code: "AMD", label: "Armenian Dram (֏)" },
  { code: "ANG", label: "Netherlands Antillean Guilder (ƒ)" },
  { code: "AOA", label: "Angolan Kwanza (Kz)" },
  { code: "ARS", label: "Argentine Peso ($)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "AWG", label: "Aruban Florin (ƒ)" },
  { code: "AZN", label: "Azerbaijani Manat (₼)" },
  { code: "BAM", label: "Bosnia-Herzegovina Convertible Mark (KM)" },
  { code: "BBD", label: "Barbadian Dollar ($)" },
  { code: "BDT", label: "Bangladeshi Taka (৳)" },
  { code: "BGN", label: "Bulgarian Lev (лв)" },
  { code: "BHD", label: "Bahraini Dinar (.د.ب)" },
  { code: "BIF", label: "Burundian Franc (FBu)" },
  { code: "BMD", label: "Bermudan Dollar ($)" },
  { code: "BND", label: "Brunei Dollar ($)" },
  { code: "BOB", label: "Bolivian Boliviano (Bs.)" },
  { code: "BRL", label: "Brazilian Real (R$)" },
  { code: "BSD", label: "Bahamian Dollar ($)" },
  { code: "BTN", label: "Bhutanese Ngultrum (Nu.)" },
  { code: "BWP", label: "Botswanan Pula (P)" },
  { code: "BYN", label: "Belarusian Ruble (Br)" },
  { code: "BZD", label: "Belize Dollar ($)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "CDF", label: "Congolese Franc (FC)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "CLP", label: "Chilean Peso ($)" },
  { code: "CNY", label: "Chinese Yuan (¥)" },
  { code: "COP", label: "Colombian Peso ($)" },
  { code: "CRC", label: "Costa Rican Colón (₡)" },
  { code: "CUP", label: "Cuban Peso ($)" },
  { code: "CVE", label: "Cape Verdean Escudo ($)" },
  { code: "CZK", label: "Czech Koruna (Kč)" },
  { code: "DJF", label: "Djiboutian Franc (Fdj)" },
  { code: "DKK", label: "Danish Krone (kr)" },
  { code: "DOP", label: "Dominican Peso ($)" },
  { code: "DZD", label: "Algerian Dinar (د.ج)" },
  { code: "EGP", label: "Egyptian Pound (£)" },
  { code: "ERN", label: "Eritrean Nakfa (Nfk)" },
  { code: "ETB", label: "Ethiopian Birr (Br)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "FJD", label: "Fijian Dollar ($)" },
  { code: "FKP", label: "Falkland Islands Pound (£)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "GEL", label: "Georgian Lari (₾)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "GIP", label: "Gibraltar Pound (£)" },
  { code: "GMD", label: "Gambian Dalasi (D)" },
  { code: "GNF", label: "Guinean Franc (FG)" },
  { code: "GTQ", label: "Guatemalan Quetzal (Q)" },
  { code: "GYD", label: "Guyanese Dollar ($)" },
  { code: "HKD", label: "Hong Kong Dollar (HK$)" },
  { code: "HNL", label: "Honduran Lempira (L)" },
  { code: "HRK", label: "Croatian Kuna (kn)" },
  { code: "HTG", label: "Haitian Gourde (G)" },
  { code: "HUF", label: "Hungarian Forint (Ft)" },
  { code: "IDR", label: "Indonesian Rupiah (Rp)" },
  { code: "ILS", label: "Israeli New Shekel (₪)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "IQD", label: "Iraqi Dinar (ع.د)" },
  { code: "IRR", label: "Iranian Rial (﷼)" },
  { code: "ISK", label: "Icelandic Króna (kr)" },
  { code: "JMD", label: "Jamaican Dollar ($)" },
  { code: "JOD", label: "Jordanian Dinar (د.ا)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "KGS", label: "Kyrgystani Som (лв)" },
  { code: "KHR", label: "Cambodian Riel (៛)" },
  { code: "KMF", label: "Comorian Franc (CF)" },
  { code: "KPW", label: "North Korean Won (₩)" },
  { code: "KRW", label: "South Korean Won (₩)" },
  { code: "KWD", label: "Kuwaiti Dinar (د.ك)" },
  { code: "KYD", label: "Cayman Islands Dollar ($)" },
  { code: "KZT", label: "Kazakhstani Tenge (₸)" },
  { code: "LAK", label: "Laotian Kip (₭)" },
  { code: "LBP", label: "Lebanese Pound (ل.ل)" },
  { code: "LKR", label: "Sri Lankan Rupee (₨)" },
  { code: "LRD", label: "Liberian Dollar ($)" },
  { code: "LSL", label: "Lesotho Loti (L)" },
  { code: "LYD", label: "Libyan Dinar (ل.د)" },
  { code: "MAD", label: "Moroccan Dirham (د.م.)" },
  { code: "MDL", label: "Moldovan Leu (L)" },
  { code: "MGA", label: "Malagasy Ariary (Ar)" },
  { code: "MKD", label: "Macedonian Denar (den)" },
  { code: "MMK", label: "Myanmar Kyat (K)" },
  { code: "MNT", label: "Mongolian Tugrik (₮)" },
  { code: "MOP", label: "Macanese Pataca (P)" },
  { code: "MRU", label: "Mauritanian Ouguiya (UM)" },
  { code: "MUR", label: "Mauritian Rupee (₨)" },
  { code: "MVR", label: "Maldivian Rufiyaa (Rf)" },
  { code: "MWK", label: "Malawian Kwacha (MK)" },
  { code: "MXN", label: "Mexican Peso ($)" },
  { code: "MYR", label: "Malaysian Ringgit (RM)" },
  { code: "MZN", label: "Mozambican Metical (MT)" },
  { code: "NAD", label: "Namibian Dollar ($)" },
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "NIO", label: "Nicaraguan Córdoba (C$)" },
  { code: "NOK", label: "Norwegian Krone (kr)" },
  { code: "NPR", label: "Nepalese Rupee (₨)" },
  { code: "NZD", label: "New Zealand Dollar (NZ$)" },
  { code: "OMR", label: "Omani Rial (﷼)" },
  { code: "PAB", label: "Panamanian Balboa (B/.)" },
  { code: "PEN", label: "Peruvian Sol (S/.)" },
  { code: "PGK", label: "Papua New Guinean Kina (K)" },
  { code: "PHP", label: "Philippine Peso (₱)" },
  { code: "PKR", label: "Pakistani Rupee (₨)" },
  { code: "PLN", label: "Polish Zloty (zł)" },
  { code: "PYG", label: "Paraguayan Guarani (₲)" },
  { code: "QAR", label: "Qatari Rial (﷼)" },
  { code: "RON", label: "Romanian Leu (lei)" },
  { code: "RSD", label: "Serbian Dinar (din)" },
  { code: "RUB", label: "Russian Ruble (₽)" },
  { code: "RWF", label: "Rwandan Franc (FRw)" },
  { code: "SAR", label: "Saudi Riyal (ر.س)" },
  { code: "SBD", label: "Solomon Islands Dollar ($)" },
  { code: "SCR", label: "Seychellois Rupee (₨)" },
  { code: "SDG", label: "Sudanese Pound (£)" },
  { code: "SEK", label: "Swedish Krona (kr)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
  { code: "SHP", label: "St. Helena Pound (£)" },
  { code: "SLL", label: "Sierra Leonean Leone (Le)" },
  { code: "SOS", label: "Somali Shilling (Sh)" },
  { code: "SRD", label: "Surinamese Dollar ($)" },
  { code: "SSP", label: "South Sudanese Pound (£)" },
  { code: "STN", label: "São Tomé & Príncipe Dobra (Db)" },
  { code: "SYP", label: "Syrian Pound (£)" },
  { code: "SZL", label: "Swazi Lilangeni (L)" },
  { code: "THB", label: "Thai Baht (฿)" },
  { code: "TJS", label: "Tajikistani Somoni (SM)" },
  { code: "TMT", label: "Turkmenistani Manat (m)" },
  { code: "TND", label: "Tunisian Dinar (د.ت)" },
  { code: "TOP", label: "Tongan Pa'anga (T$)" },
  { code: "TRY", label: "Turkish Lira (₺)" },
  { code: "TTD", label: "Trinidad & Tobago Dollar ($)" },
  { code: "TWD", label: "New Taiwan Dollar (NT$)" },
  { code: "TZS", label: "Tanzanian Shilling (Sh)" },
  { code: "UAH", label: "Ukrainian Hryvnia (₴)" },
  { code: "UGX", label: "Ugandan Shilling (USh)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "UYU", label: "Uruguayan Peso ($)" },
  { code: "UZS", label: "Uzbekistani Som (лв)" },
  { code: "VES", label: "Venezuelan Bolívar Soberano (Bs.S)" },
  { code: "VND", label: "Vietnamese Dong (₫)" },
  { code: "VUV", label: "Vanuatu Vatu (Vt)" },
  { code: "WST", label: "Samoan Tala (T)" },
  { code: "XAF", label: "Central African CFA Franc (FCFA)" },
  { code: "XCD", label: "East Caribbean Dollar ($)" },
  { code: "XOF", label: "West African CFA Franc (CFA)" },
  { code: "XPF", label: "CFP Franc (₣)" },
  { code: "YER", label: "Yemeni Rial (﷼)" },
  { code: "ZAR", label: "South African Rand (R)" },
  { code: "ZMW", label: "Zambian Kwacha (ZK)" },
  { code: "ZWL", label: "Zimbabwean Dollar ($)" }
];

function CurrencyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStore();
  const db = useFirestore();
  const { toast } = useToast();
  
  const isSetup = searchParams.get("setup") === "true";
  
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const sortedCurrencies = useMemo(() => {
    return [...CURRENCIES].sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredCurrencies = useMemo(() => {
    return sortedCurrencies.filter(c => 
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedCurrencies, searchQuery]);

  useEffect(() => {
    if (user?.currency) setSelectedCurrency(user.currency);
  }, [user]);

  const selectedCurrencyLabel = useMemo(() => {
    return CURRENCIES.find(c => c.code === selectedCurrency)?.label || "Pick a currency...";
  }, [selectedCurrency]);

  const handleUpdateCurrency = async () => {
    if (!db || !user || !selectedCurrency) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { currency: selectedCurrency });
      toast({ title: "Preference Saved", description: `Vault currency updated to ${selectedCurrency}.` });
      if (isSetup) router.replace("/dashboard");
      else router.back();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background no-scrollbar">
      {!isSetup && <Navbar />}
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {!isSetup && (
          <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0 glass border-white/5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-glow">Currency</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Regional Payload Formatter</p>
            </div>
          </motion.header>
        )}

        <Card className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <CardHeader className="text-center pt-12 pb-6">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 glow-primary shadow-inner">
              <Globe className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl font-black uppercase tracking-tighter text-glow">
              {isSetup ? "IDENTITY PROTOCOL" : "UPDATE FORMAT"}
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 px-8 leading-relaxed">
              {isSetup 
                ? "Establish your default currency for cross-vault ledger synchronization."
                : "Recalculate global visual output using a new regional currency node."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3">
              <Label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Select Node</Label>
              
              <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-16 rounded-2xl glass border-white/5 text-xs font-black uppercase tracking-widest justify-between px-6 hover:bg-white/5 transition-all"
                  >
                    <span className="truncate pr-4">{selectedCurrencyLabel}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-primary opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-[2rem] border-white/5 shadow-2xl overflow-hidden glass-card" align="start">
                  <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
                    <Search className="h-4 w-4 text-primary shrink-0" />
                    <Input
                      placeholder="SEARCH SYMBOL..."
                      className="h-9 border-none bg-transparent focus-visible:ring-0 px-0 text-[10px] font-black uppercase tracking-widest placeholder:opacity-30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="h-80">
                    <div className="p-2 space-y-1">
                      {filteredCurrencies.map((currency) => {
                        const isSelected = selectedCurrency === currency.code;
                        return (
                          <button
                            key={currency.code}
                            className={cn(
                              "flex w-full items-center justify-between px-4 py-4 rounded-xl text-xs transition-all",
                              isSelected 
                                ? "bg-primary text-primary-foreground font-black shadow-lg glow-primary" 
                                : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                              setSelectedCurrency(currency.code);
                              setIsPickerOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="flex flex-col items-start min-w-0">
                              <span className="truncate text-left uppercase font-black text-[10px] tracking-tight">{currency.label}</span>
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest mt-0.5 opacity-50",
                                isSelected && "opacity-100"
                              )}>
                                {currency.code}
                              </span>
                            </div>
                            {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handleUpdateCurrency} 
              className="w-full bg-primary h-16 rounded-[2rem] font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl glow-primary transition-all active:scale-95" 
              disabled={loading || !selectedCurrency || (!isSetup && selectedCurrency === user?.currency)}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isSetup ? (
                <>Initialize System<Check className="h-5 w-5" /></>
              ) : (
                <>Synchronize Preference<Save className="h-5 w-5" /></>
              )}
            </Button>
            
            {isSetup && (
              <div className="flex flex-col items-center gap-2 opacity-30">
                 <Cpu className="h-4 w-4 text-primary" />
                 <p className="text-[8px] font-black uppercase tracking-widest italic">Node parameters can be modified via Profile > Terminal.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function CurrencyPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary glow-primary" /></div>}>
      <CurrencyContent />
    </Suspense>
  );
}
