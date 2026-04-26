import { DEFAULT_RAW_PRICES, sanitizeKey } from "./lib/constants";
import { app as firebaseApp, auth, db } from "./lib/firebase";
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { CalculatorApp } from "./components/CalculatorApp";
import { LoginScreen } from "./components/LoginScreen";

export default function App() {
  const [view, setView] = useState<"login" | "manager" | "admin">("login");
  const [user, setUser] = useState<any>(null);
  const [isCloudActive, setIsCloudActive] = useState(false);

  // Global prices
  const [globalRawPrices, setGlobalRawPrices] = useState<Record<string, string>>(DEFAULT_RAW_PRICES);
  const [globalScrapPrice, setGlobalScrapPrice] = useState("20000");
  const [globalRemnantPrice, setGlobalRemnantPrice] = useState("30000");
  const [customGrades, setCustomGrades] = useState<string[]>([]);
  const [remnantPricing, setRemnantPricing] = useState<Record<string, { round: string; hex: string }>>({});

  useEffect(() => {
    if (!auth) {
      setUser({ uid: "local-user" });
      return;
    }
    const initAuth = async () => {
      try {
        // @ts-ignore
        const loginTask = typeof window !== "undefined" && window.__initial_auth_token
            // @ts-ignore
            ? signInWithCustomToken(auth, window.__initial_auth_token)
            : signInAnonymously(auth);

        const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("AuthTimeout")), 3000));
        await Promise.race([loginTask, timeoutTask]);
      } catch (e) {
        console.warn("Auth failed or timed out, working offline", e);
        setUser({ uid: "local-user" });
        setIsCloudActive(false);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setIsCloudActive(true);
      } else {
        setUser({ uid: "local-user" });
        setIsCloudActive(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    try {
      if (typeof window !== "undefined") {
        const savedRaw = window.localStorage.getItem("arsenal_raw_prices");
        const savedScrap = window.localStorage.getItem("arsenal_scrap_price");
        const savedRemnant = window.localStorage.getItem("arsenal_remnant_price");
        const savedCustomGrades = window.localStorage.getItem("arsenal_custom_grades");
        const savedRemnantPricing = window.localStorage.getItem("arsenal_remnant_pricing");

        let loadedCustomGrades: string[] = [];
        if (savedCustomGrades) {
          loadedCustomGrades = JSON.parse(savedCustomGrades);
          setCustomGrades(loadedCustomGrades);
        }

        if (savedRemnantPricing) {
          setRemnantPricing(JSON.parse(savedRemnantPricing));
        }

        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          const loadedPrices = { ...DEFAULT_RAW_PRICES };
          const allG = [...Object.keys(DEFAULT_RAW_PRICES), ...loadedCustomGrades];
          allG.forEach((grade) => {
            if (parsed[grade] !== undefined) loadedPrices[grade] = parsed[grade];
          });
          setGlobalRawPrices(loadedPrices);
        }
        if (savedScrap) setGlobalScrapPrice(savedScrap);
        if (savedRemnant) setGlobalRemnantPrice(savedRemnant);
      }
    } catch (e) {}

    // @ts-ignore
    const appId = typeof window !== "undefined" && window.__app_id ? window.__app_id : "github-arsenal-app";
    if (db && appId && isCloudActive && user.uid !== "local-user") {
      const pricesDocRef = doc(db, "artifacts", appId, "public", "data", "settings", "prices");
      const unsubscribe = onSnapshot(
        pricesDocRef,
        { includeMetadataChanges: true },
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            let currentCustomGrades = customGrades;
            if (data.customGrades) {
              currentCustomGrades = data.customGrades;
              setCustomGrades(currentCustomGrades);
              if (typeof window !== "undefined") window.localStorage.setItem("arsenal_custom_grades", JSON.stringify(currentCustomGrades));
            }

            if (data.remnantPricing) {
              setRemnantPricing(data.remnantPricing);
              if (typeof window !== "undefined") window.localStorage.setItem("arsenal_remnant_pricing", JSON.stringify(data.remnantPricing));
            }

            if (data.rawPrices) {
              const loadedPrices = { ...DEFAULT_RAW_PRICES };
              const allG = [...Object.keys(DEFAULT_RAW_PRICES), ...currentCustomGrades];
              allG.forEach((grade) => {
                const dbKey = sanitizeKey(grade);
                if (data.rawPrices[dbKey] !== undefined) {
                  loadedPrices[grade] = data.rawPrices[dbKey];
                }
              });
              setGlobalRawPrices(loadedPrices);
              if (typeof window !== "undefined") window.localStorage.setItem("arsenal_raw_prices", JSON.stringify(loadedPrices));
            }
            if (data.scrapPrice !== undefined) {
              setGlobalScrapPrice(data.scrapPrice);
              if (typeof window !== "undefined") window.localStorage.setItem("arsenal_scrap_price", data.scrapPrice);
            }
            if (data.remnantPrice !== undefined) {
              setGlobalRemnantPrice(data.remnantPrice);
              if (typeof window !== "undefined") window.localStorage.setItem("arsenal_remnant_price", data.remnantPrice);
            }
          }
        },
        (error) => {
          console.warn("Облако недоступно, работаем локально:", error);
          setIsCloudActive(false);
        }
      );
      return () => unsubscribe();
    }
  }, [user, isCloudActive]);

  const handleSaveGlobal = async (
    rawPricesObj: Record<string, string>,
    scrapStr: string,
    remnantStr: string,
    cGrades: string[],
    rPricing: Record<string, { round: string; hex: string }>
  ) => {
    setGlobalRawPrices(rawPricesObj);
    setGlobalScrapPrice(scrapStr);
    setGlobalRemnantPrice(remnantStr);
    if (cGrades) setCustomGrades(cGrades);
    if (rPricing) setRemnantPricing(rPricing);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("arsenal_raw_prices", JSON.stringify(rawPricesObj));
        window.localStorage.setItem("arsenal_scrap_price", scrapStr);
        window.localStorage.setItem("arsenal_remnant_price", remnantStr);
        if (cGrades) window.localStorage.setItem("arsenal_custom_grades", JSON.stringify(cGrades));
        if (rPricing) window.localStorage.setItem("arsenal_remnant_pricing", JSON.stringify(rPricing));
      }
    } catch (e) {}

    // @ts-ignore
    const appId = typeof window !== "undefined" && window.__app_id ? window.__app_id : "github-arsenal-app";
    if (db && user && appId && isCloudActive && user.uid !== "local-user") {
      const firestoreRawPrices: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawPricesObj)) {
        firestoreRawPrices[sanitizeKey(k)] = v;
      }
      const payload: any = {
        rawPrices: firestoreRawPrices,
        scrapPrice: scrapStr,
        remnantPrice: remnantStr,
      };
      if (cGrades) payload.customGrades = cGrades;
      if (rPricing) payload.remnantPricing = rPricing;

      const pricesDocRef = doc(db, "artifacts", appId, "public", "data", "settings", "prices");
      await setDoc(pricesDocRef, payload, { merge: true });
    }
  };

  if (view === "login") {
    return <LoginScreen onManagerLogin={() => setView("manager")} onAdminLogin={() => setView("admin")} isCloudActive={isCloudActive} />;
  }

  if (view === "admin") {
    return (
      <AdminPanel
        initialRawPrices={globalRawPrices}
        initialScrap={globalScrapPrice}
        initialRemnant={globalRemnantPrice}
        initialCustomGrades={customGrades}
        initialRemnantPricing={remnantPricing}
        onSave={handleSaveGlobal}
        onLogout={() => setView("login")}
        isCloudActive={isCloudActive}
      />
    );
  }

  return (
    <CalculatorApp
      adminRawPrices={globalRawPrices}
      adminScrapPrice={globalScrapPrice}
      adminRemnantPrice={globalRemnantPrice}
      customGrades={customGrades}
      remnantPricing={remnantPricing}
      onLogout={() => setView("login")}
      isCloudActive={isCloudActive}
    />
  );
}
