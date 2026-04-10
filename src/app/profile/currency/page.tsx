
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
import { ArrowLeft, Globe, Loader2, Save, Check, Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

  // Sort currencies alphabetically by label
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
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  }, [user]);

  const selectedCurrencyLabel = useMemo(() => {
    return CURRENCIES.find(c => c.code === selectedCurrency)?.label || "Pick a currency...";
  }, [selectedCurrency]);

  const handleUpdateCurrency = async () => {
    if (!db || !user || !selectedCurrency) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        currency: selectedCurrency
      });
      toast({
        title: isSetup ? "Setup Complete" : "Currency Updated",
        description: `Your default currency is now set to ${selectedCurrency}.`
      });
      
      if (isSetup) {
        router.replace("/dashboard");
      } else {
        router.back();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save currency preference."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {!isSetup && <Navbar />}
      
      <main className="flex-1 p-4 md:p-8 pb-32 md:pb-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {!isSetup && (
          <header className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10 shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-headline text-primary">Default Currency</h1>
              <p className="text-muted-foreground">Select how your amounts are displayed.</p>
            </div>
          </header>
        )}

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-card">
          <CardHeader className="text-center pt-10">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Globe className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-xl">
              {isSetup ? "Welcome to Wisely!" : "Change Currency"}
            </CardTitle>
            <CardDescription className="text-sm px-6">
              {isSetup 
                ? "Let's get started by picking your preferred currency for personal and shared tracking."
                : "This updates the symbol and calculations used across all your expenses."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3">
              <Label htmlFor="currency" className="font-bold text-sm uppercase tracking-widest text-muted-foreground px-1">
                Select Currency
              </Label>
              
              <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="currency"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isPickerOpen}
                    className="w-full h-14 rounded-2xl bg-muted/30 border-none text-base font-medium justify-between px-4 hover:bg-muted/40 transition-colors"
                  >
                    <span className="truncate pr-4">{selectedCurrencyLabel}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-none shadow-2xl overflow-hidden bg-card" align="start">
                  <div className="p-3 border-b flex items-center gap-3 bg-muted/10">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      placeholder="Search currency name or code..."
                      className="h-9 border-none bg-transparent focus-visible:ring-0 px-0 placeholder:text-muted-foreground/60"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="h-72">
                    <div className="p-1 space-y-0.5">
                      {filteredCurrencies.map((currency) => {
                        const isSelected = selectedCurrency === currency.code;
                        return (
                          <button
                            key={currency.code}
                            className={cn(
                              "flex w-full items-center justify-between px-3 py-3 rounded-xl text-sm transition-all group",
                              isSelected 
                                ? "bg-primary text-primary-foreground font-bold" 
                                : "hover:bg-muted text-foreground"
                            )}
                            onClick={() => {
                              setSelectedCurrency(currency.code);
                              setIsPickerOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="flex flex-col items-start min-w-0">
                              <span className="truncate text-left">{currency.label}</span>
                              <span className={cn(
                                "text-[10px] uppercase font-bold tracking-widest",
                                isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {currency.code}
                              </span>
                            </div>
                            {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                      {filteredCurrencies.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-2">
                          <Globe className="h-8 w-8 text-muted-foreground opacity-20" />
                          <p className="text-xs text-muted-foreground font-medium">No currency matches your search.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <Button 
              onClick={handleUpdateCurrency} 
              className="w-full bg-primary h-14 rounded-2xl font-bold text-base gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95" 
              disabled={loading || !selectedCurrency || (!isSetup && selectedCurrency === user?.currency)}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isSetup ? (
                <>
                  Complete Setup
                  <Check className="h-6 w-6" />
                </>
              ) : (
                <>
                  Save Preference
                  <Save className="h-6 w-6" />
                </>
              )}
            </Button>
            
            {isSetup && (
              <p className="text-center text-xs text-muted-foreground font-medium italic">
                You can change this anytime in your profile settings.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function CurrencyPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-primary font-bold">Loading setup...</div>}>
      <CurrencyContent />
    </Suspense>
  );
}
