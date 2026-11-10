// Every store MotorCompare reads. Real parts shops in the US, UK, Canada, Australia and NZ only, never
// marketplaces. Each one is read through its public Shopify products.json or
// the WooCommerce Store API, two at a time at most, about a request a second,
// and a store that keeps answering 403/429 is skipped for the run (never
// worked around).
//
// From the 2026-11-08 store probe (probe-stores.yml, 290 hosts, 185 readable
// in AUD): the shops selling car parts whose SKUs carry the makers' part
// numbers (or, for a few, barcodes), one per stock (lightforce.com.au is
// au.lightforce.com). Left out: shops priced in USD (Competition Motorsport,
// Ironman 4x4, Turbosmart), body-kit and carbon shops with nothing another
// store sells, and shops with no part numbers or barcodes we can read. The big
// chains (Supercheap Auto, Repco, Autobarn, Sparesbox) block reading; they are
// search rows instead (lib/affiliate.ts PARTNERS).
import type { RegionCode } from "@/site";

export interface Store {
  id: string;
  name: string;
  region: RegionCode;
  /** https://host, no trailing slash */
  base: string;
  /** shopify: products.json; woocommerce: the Store API (lib/import/woocommerce.ts);
   *  pages: sitemap + each product page's schema.org GTIN (lib/import/pages.ts),
   *  read by the import workflow's page jobs (scripts/read-pages.ts). */
  platform: "shopify" | "woocommerce" | "pages";
  /** pages stores: where the product pages are listed and which ones to read. */
  pages?: {
    /** sitemap URLs (relative to base) when robots.txt names none or the wrong ones */
    sitemaps?: string[];
    /** in a sitemap index, only the child sitemaps whose URL matches */
    sitemapMatch?: string;
    /** only page paths matching this (a department store's fragrance pages) */
    urlMatch?: string;
    /** pages read per run (default PAGES_PER_RUN) */
    budget?: number;
  };
  /** Sells more than car parts (a camping or hardware store): only products
   *  with a car parts word in the title count (scripts/import.ts). */
  mixed?: boolean;
  /** The brand's own store (official prices): compared like any store, and
   *  marked as the maker's own shop. */
  official?: boolean;
  /** Pays us a commission (shown as "Paid link"): the query parameter and the
   *  env var holding our code, set once the store's program accepts us. */
  affiliate?: { param: string; envVar: string };
}

export const STORES: Store[] = [
  { id: "ppdperformance", name: "PPD Performance", region: "AU", base: "https://ppdperformance.com.au", platform: "shopify" },
  { id: "automegastore", name: "Auto Mega Store", region: "AU", base: "https://automegastore.com.au", platform: "shopify" },
  { id: "subieshop", name: "Subie Shop", region: "AU", base: "https://subieshop.com.au", platform: "shopify" },
  { id: "wipersdirect", name: "Wipers Direct", region: "AU", base: "https://wipersdirect.com.au", platform: "woocommerce" },
  { id: "autocave", name: "Autocave", region: "AU", base: "https://autocave.com.au", platform: "shopify" },
  { id: "motoquipe", name: "Motoquipe", region: "AU", base: "https://motoquipe.com.au", platform: "shopify" },
  { id: "justjap", name: "Just Jap", region: "AU", base: "https://justjap.com", platform: "shopify" },
  { id: "bcracing", name: "BC Racing Australia", region: "AU", base: "https://bcracing.com.au", platform: "shopify", official: true },
  { id: "clutchdirect", name: "Clutch Direct", region: "AU", base: "https://clutchdirect.com.au", platform: "shopify" },
  { id: "universalautospares", name: "Universal Auto Spares", region: "AU", base: "https://universalautospares.com.au", platform: "shopify" },
  { id: "halfpriceparts", name: "Half Price Parts", region: "AU", base: "https://halfpriceparts.com.au", platform: "shopify" },
  { id: "rampedup4x4", name: "Ramped Up 4x4", region: "AU", base: "https://rampedup4x4.com.au", platform: "shopify" },
  { id: "quickautoparts", name: "Quick Auto Parts", region: "AU", base: "https://quickautoparts.com.au", platform: "woocommerce" },
  { id: "partscity", name: "Parts City", region: "AU", base: "https://partscity.com.au", platform: "shopify" },
  { id: "marsperformance", name: "Mars Performance", region: "AU", base: "https://marsperformance.com.au", platform: "shopify" },
  { id: "jtmauto", name: "JTM Auto", region: "AU", base: "https://jtmauto.com.au", platform: "shopify" },
  { id: "brettstruck", name: "Brett's Truck Parts", region: "AU", base: "https://brettstruck.com.au", platform: "shopify" },
  { id: "vagparts", name: "VAG Parts", region: "AU", base: "https://vagparts.com.au", platform: "shopify" },
  { id: "efs4wd", name: "EFS 4WD", region: "AU", base: "https://efs4wd.com.au", platform: "woocommerce" },
  { id: "mytuff4x4", name: "MyTuff 4x4", region: "AU", base: "https://mytuff4x4.com.au", platform: "shopify" },
  { id: "bavarianspeed", name: "Bavarian Speed", region: "AU", base: "https://bavarianspeed.com.au", platform: "shopify" },
  { id: "a1autopartsniddrie", name: "A1 Auto Parts Niddrie", region: "AU", base: "https://a1autopartsniddrie.com.au", platform: "shopify" },
  { id: "autolines", name: "Autolines", region: "AU", base: "https://autolines.com.au", platform: "shopify" },
  { id: "swd", name: "SWD", region: "AU", base: "https://swd.com.au", platform: "shopify" },
  { id: "sparkplugsdirect", name: "Spark Plugs Direct", region: "AU", base: "https://sparkplugsdirect.com.au", platform: "shopify" },
  { id: "myautoparts", name: "My Auto Parts", region: "AU", base: "https://myautoparts.com.au", platform: "shopify" },
  { id: "frankiesautoelectrics", name: "Frankies Auto Electrics", region: "AU", base: "https://frankiesautoelectrics.com.au", platform: "shopify" },
  { id: "deaperformance", name: "DEA Performance", region: "AU", base: "https://deaperformance.com.au", platform: "shopify" },
  { id: "batteryspecialists", name: "Battery Specialists", region: "AU", base: "https://batteryspecialists.com.au", platform: "shopify" },
  { id: "mcc4x4", name: "MCC 4x4", region: "AU", base: "https://mcc4x4.com.au", platform: "shopify" },
  { id: "shiftymods", name: "Shifty Mods", region: "AU", base: "https://shiftymods.com.au", platform: "shopify" },
  { id: "autoone", name: "Auto One", region: "AU", base: "https://autoone.com.au", platform: "shopify" },
  { id: "empireperformance", name: "Empire Performance", region: "AU", base: "https://empireperformance.com.au", platform: "shopify" },
  { id: "golebysparts", name: "Golebys Parts", region: "AU", base: "https://golebysparts.au", platform: "shopify" },
  { id: "ssmperformanceparts", name: "SSM Performance Parts", region: "AU", base: "https://ssmperformanceparts.com.au", platform: "woocommerce" },
  { id: "dencodiesel", name: "Denco Diesel", region: "AU", base: "https://dencodiesel.com", platform: "shopify" },
  { id: "lamspeedracing", name: "Lamspeed Racing", region: "AU", base: "https://lamspeedracing.com", platform: "shopify" },
  { id: "vcmperformance", name: "VCM Performance", region: "AU", base: "https://vcmperformance.com.au", platform: "shopify" },
  { id: "batterycentralbrisbane", name: "Battery Central Brisbane", region: "AU", base: "https://batterycentralbrisbane.com.au", platform: "woocommerce" },
  { id: "neveraauto", name: "Nevera Auto", region: "AU", base: "https://neveraauto.com.au", platform: "shopify" },
  { id: "performancewarehouse", name: "Performance Warehouse", region: "AU", base: "https://performancewarehouse.com.au", platform: "shopify" },
  { id: "prospeedracing", name: "Pro Speed Racing", region: "AU", base: "https://prospeedracing.com.au", platform: "shopify" },
  { id: "eagleautoparts", name: "Eagle Auto Parts", region: "AU", base: "https://eagleautoparts.com.au", platform: "shopify" },
  { id: "ausgo4wd", name: "AusGo 4WD", region: "AU", base: "https://ausgo4wd.com.au", platform: "shopify" },
  { id: "thebatterybase", name: "The Battery Base", region: "AU", base: "https://thebatterybase.com.au", platform: "woocommerce" },
  { id: "autopartsguys", name: "Auto Parts Guys", region: "AU", base: "https://autopartsguys.com.au", platform: "shopify" },
  { id: "enginemaster", name: "Engine Master", region: "AU", base: "https://enginemaster.com.au", platform: "shopify" },
  { id: "elevateauto", name: "Elevate Auto", region: "AU", base: "https://elevateauto.com.au", platform: "shopify" },
  { id: "clickableautomotive", name: "Clickable Automotive", region: "AU", base: "https://clickableautomotive.com.au", platform: "shopify" },
  { id: "campingaustralia", name: "Camping Australia", region: "AU", base: "https://campingaustralia.com.au", platform: "shopify", mixed: true },
  { id: "dcjapautomotive", name: "DC Jap Automotive", region: "AU", base: "https://dcjapautomotive.com", platform: "shopify" },
  { id: "narva", name: "Narva", region: "AU", base: "https://checkout.narva.com.au", platform: "shopify", official: true },
  { id: "camdenvalley4x4", name: "Camden Valley 4x4", region: "AU", base: "https://camdenvalley4x4.com.au", platform: "shopify" },
  { id: "gktech", name: "GKTech", region: "AU", base: "https://au.gktech.com", platform: "shopify", official: true },
  { id: "alliedautoonline", name: "Allied Auto Online", region: "AU", base: "https://alliedautoonline.com.au", platform: "shopify" },
  { id: "holdcom", name: "Holdcom", region: "AU", base: "https://holdcom.com.au", platform: "shopify" },
  { id: "mkmotorsports", name: "MK Motorsports", region: "AU", base: "https://mkmotorsports.com.au", platform: "shopify" },
  { id: "automodellista", name: "Automodellista", region: "AU", base: "https://automodellista.com.au", platform: "shopify" },
  { id: "s1320motorsports", name: "1320 Motorsports", region: "AU", base: "https://1320motorsports.com.au", platform: "shopify" },
  { id: "rooracing", name: "Roo Racing", region: "AU", base: "https://rooracing.au", platform: "shopify" },
  { id: "australiaspeed", name: "Australia Speed", region: "AU", base: "https://australiaspeed.com.au", platform: "shopify" },
  { id: "tranzmile", name: "Tranzmile", region: "AU", base: "https://tranzmile.com", platform: "shopify" },
  { id: "s4wdpartshop", name: "4WD Part Shop", region: "AU", base: "https://4wdpartshop.com.au", platform: "woocommerce" },
  { id: "s4x4extrasonline", name: "4x4 Extras Online", region: "AU", base: "https://4x4extrasonline.com.au", platform: "shopify" },
  { id: "homeof12voltonline", name: "Home of 12 Volt", region: "AU", base: "https://homeof12voltonline.com.au", platform: "shopify" },
  { id: "iilumo", name: "iilumo", region: "AU", base: "https://iilumo.com", platform: "shopify", official: true },
  { id: "everythingcaravans", name: "Everything Caravans", region: "AU", base: "https://everythingcaravans.com.au", platform: "shopify", mixed: true },
  { id: "demonproparts", name: "Demon Pro Parts", region: "AU", base: "https://demonproparts.com.au", platform: "shopify" },
  { id: "zerooffset", name: "Zero Offset", region: "AU", base: "https://zerooffset.com.au", platform: "shopify" },
  { id: "kickassproducts", name: "KickAss Products", region: "AU", base: "https://kickassproducts.com.au", platform: "shopify", official: true },
  { id: "detailingshed", name: "Detailing Shed", region: "AU", base: "https://detailingshed.com.au", platform: "shopify" },
  { id: "akracing", name: "AK Racing", region: "AU", base: "https://akracing.com.au", platform: "woocommerce" },
  { id: "vicoffroad", name: "Vic Offroad", region: "AU", base: "https://vicoffroad.com.au", platform: "shopify" },
  { id: "moorabbinbatteries", name: "Moorabbin Batteries", region: "AU", base: "https://moorabbinbatteries.com.au", platform: "shopify" },
  { id: "jaydeeautocables", name: "Jay Dee Auto Cables", region: "AU", base: "https://jaydeeautocables.com.au", platform: "shopify" },
  { id: "perthdiesel", name: "Perth Diesel", region: "AU", base: "https://perthdiesel.store", platform: "shopify" },
  { id: "carcareco", name: "Car Care Co", region: "AU", base: "https://carcareco.com.au", platform: "woocommerce" },
  { id: "goind", name: "Goind", region: "AU", base: "https://goind.com.au", platform: "shopify" },
  { id: "platinumracingproducts", name: "Platinum Racing Products", region: "AU", base: "https://platinumracingproducts.com", platform: "shopify" },
  { id: "lightforce", name: "Lightforce", region: "AU", base: "https://au.lightforce.com", platform: "shopify", official: true },
  { id: "detailstore", name: "Detail Store", region: "AU", base: "https://detailstore.com.au", platform: "shopify" },
  { id: "spectr", name: "Spectr", region: "AU", base: "https://spectr.com.au", platform: "shopify", official: true },
  { id: "waxit", name: "Waxit", region: "AU", base: "https://waxit.com.au", platform: "shopify", official: true },
  { id: "itechworld", name: "iTechworld", region: "AU", base: "https://itechworld.com.au", platform: "shopify", mixed: true },
  { id: "aimsindustrial", name: "AIMS Industrial", region: "AU", base: "https://aimsindustrial.com.au", platform: "shopify", mixed: true },
  { id: "energyeco", name: "Energy Eco", region: "AU", base: "https://energyeco.com.au", platform: "shopify" },
  { id: "outbax", name: "Outbax", region: "AU", base: "https://outbax.com.au", platform: "shopify", mixed: true },
  { id: "mdcarcare", name: "MD Car Care", region: "AU", base: "https://mdcarcare.com.au", platform: "shopify" },
  { id: "carcareproducts", name: "Car Care Products", region: "AU", base: "https://carcareproducts.com.au", platform: "shopify" },
  { id: "campervanbuilders", name: "Campervan Builders", region: "AU", base: "https://campervanbuilders.com.au", platform: "shopify", mixed: true },
  { id: "savagetech", name: "Savage Tech", region: "AU", base: "https://savagetech.com.au", platform: "shopify" },
  { id: "premiumdiagnostics", name: "Premium Diagnostics", region: "AU", base: "https://premium-diagnostics.com.au", platform: "shopify" },
  { id: "autobuff", name: "Autobuff", region: "AU", base: "https://autobuff.com.au", platform: "shopify" },
  { id: "snowfoam", name: "Snowfoam", region: "AU", base: "https://snowfoam.com.au", platform: "shopify", official: true },
  { id: "altiq", name: "Altiq", region: "AU", base: "https://altiq.com.au", platform: "shopify" },
  { id: "ozcharge", name: "OzCharge", region: "AU", base: "https://ozcharge.au", platform: "shopify" },
  { id: "cleanaworx", name: "Cleanaworx", region: "AU", base: "https://cleanaworx.com.au", platform: "shopify" },
  { id: "detailcentral", name: "Detail Central", region: "AU", base: "https://detailcentral.com.au", platform: "shopify" },
  { id: "meguiars", name: "Meguiar's Australia", region: "AU", base: "https://meguiars.com.au", platform: "woocommerce", official: true },
  { id: "enerdrive", name: "Enerdrive", region: "AU", base: "https://enerdrive.com.au", platform: "shopify", official: true },
  { id: "sonax", name: "Sonax Australia", region: "AU", base: "https://sonax.com.au", platform: "shopify", official: true },
  // 2026-11-10 expansion (probe rounds 1 and 2, probe/summary.md): the readable US and UK shops with car parts. Thin overlap so far; big chains are search rows (lib/affiliate.ts PARTNERS).
  { id: "adamspolishes", name: "Adam's Polishes", region: "US", base: "https://adamspolishes.com", platform: "shopify", official: true },
  { id: "autofiber", name: "Autofiber", region: "US", base: "https://autofiber.com", platform: "shopify", official: true },
  { id: "autoglanz", name: "AutoGlanz AG Car Care", region: "UK", base: "https://autoglanz.co.uk", platform: "shopify" },
  { id: "batteryclerk", name: "BatteryClerk", region: "US", base: "https://batteryclerk.com", platform: "shopify" },
  { id: "chemicalguys", name: "Chemical Guys", region: "US", base: "https://chemicalguys.com", platform: "shopify", official: true },
  { id: "dubsandtires", name: "DUBSandTIRES-Pines", region: "US", base: "https://dubsandtires.com", platform: "shopify" },
  { id: "modernperformance", name: "Modern Performance", region: "US", base: "https://modernperformance.com", platform: "shopify" },
  { id: "polishedbliss", name: "Polished Bliss", region: "UK", base: "https://polishedbliss.co.uk", platform: "shopify" },
  { id: "rallysportdirect", name: "Rallysport Direct", region: "US", base: "https://rallysportdirect.com", platform: "shopify" },
  { id: "tegiwa", name: "Tegiwa", region: "UK", base: "https://tegiwa.com", platform: "shopify" },
  { id: "theragcompany", name: "The Rag Company", region: "US", base: "https://theragcompany.com", platform: "shopify", official: true },
  { id: "turbosmart", name: "Turbosmart USA", region: "US", base: "https://turbosmart.com", platform: "shopify", official: true },
  { id: "turtlewax", name: "Turtle Wax US Store", region: "US", base: "https://turtlewax.com", platform: "shopify", official: true },
  { id: "amsperformance", name: "AMS Performance", region: "US", base: "https://www.amsperformance.com", platform: "woocommerce" },
  { id: "autopartstoys", name: "AutoPartsToys", region: "US", base: "https://autopartstoys.com", platform: "shopify" },
  { id: "batterywholesale", name: "Battery Wholesale", region: "US", base: "https://batterywholesale.com", platform: "shopify" },
  { id: "batteryworld", name: "Battery World USA", region: "US", base: "https://www.batteryworld.com", platform: "woocommerce" },
  { id: "bulbamerica", name: "BulbAmerica", region: "US", base: "https://bulbamerica.com", platform: "shopify" },
  { id: "carfunland", name: "CarFunLand", region: "US", base: "https://carfunland.com", platform: "woocommerce" },
  { id: "diyautotune", name: "DIYAutoTune", region: "US", base: "https://diyautotune.com", platform: "shopify" },
  { id: "greddy", name: "GReddy Performance Products", region: "US", base: "https://greddy.com", platform: "shopify", official: true },
  { id: "kooksheaders", name: "Kooks Headers", region: "US", base: "https://kooksheaders.com", platform: "shopify", official: true },
  { id: "odysseybattery", name: "Odyssey Battery", region: "US", base: "https://www.odysseybattery.com", platform: "woocommerce", official: true },
  // Probe round 3 (2026-11-10): more readable US, Canadian and UK shops.
  { id: "bestparts", name: "BestParts.ca", region: "CA", base: "https://bestparts.ca", platform: "shopify" },
  { id: "maperformance", name: "MAPerformance", region: "US", base: "https://maperformance.com", platform: "shopify" },
  { id: "brakesg", name: "BrakesG", region: "US", base: "https://brakesg.com", platform: "woocommerce" },
  { id: "carmats", name: "CarMats.co.uk", region: "UK", base: "https://carmats.co.uk", platform: "shopify" },
  { id: "jhpusa", name: "JHPUSA", region: "US", base: "https://jhpusa.com", platform: "shopify" },
  { id: "autopartsxs", name: "AutoPartsXS", region: "US", base: "https://autopartsxs.com", platform: "woocommerce" },
  { id: "partifyusa", name: "Partify", region: "US", base: "https://partifyusa.com", platform: "shopify" },
  { id: "urotuning", name: "UroTuning", region: "US", base: "https://urotuning.com", platform: "shopify", official: true },
  { id: "stmtuned", name: "STM Tuned Inc.", region: "US", base: "https://stmtuned.com", platform: "shopify" },
  { id: "auxito", name: "AUXITO", region: "US", base: "https://auxito.com", platform: "shopify", official: true },
  { id: "amotopart", name: "Amotopart", region: "US", base: "https://amotopart.com", platform: "shopify", mixed: true },
  { id: "hybridracing", name: "Hybrid Racing", region: "US", base: "https://hybrid-racing.com", platform: "shopify", official: true, mixed: true },
  { id: "auxbeam", name: "Auxbeam Lighting", region: "US", base: "https://auxbeam.com", platform: "shopify", official: true },
  { id: "lasfit", name: "Lasfit\u00ae", region: "US", base: "https://lasfit.com", platform: "shopify", official: true },
  { id: "deatschwerks", name: "DeatschWerks", region: "US", base: "https://deatschwerks.com", platform: "shopify", official: true, mixed: true },
  { id: "sbfilters", name: "S&B", region: "US", base: "https://sbfilters.com", platform: "shopify", official: true },
  { id: "lowbrowcustoms", name: "Lowbrow Customs", region: "US", base: "https://lowbrowcustoms.com", platform: "shopify", mixed: true },
  { id: "subimods", name: "SubiMods", region: "US", base: "https://subimods.com", platform: "shopify", mixed: true },
  { id: "jdmenginepro", name: "JDM Engine Pro", region: "US", base: "https://jdmenginepro.com", platform: "shopify" },
  { id: "fuelinjectorclinic", name: "Fuel Injector Clinic", region: "US", base: "https://fuelinjectorclinic.com", platform: "shopify" },
  { id: "carzilla", name: "CARZILLA", region: "CA", base: "https://carzilla.ca", platform: "shopify", mixed: true },
  { id: "princetires", name: "Prince Tires", region: "CA", base: "https://princetires.ca", platform: "shopify", mixed: true },
  { id: "zzperformance", name: "ZZPerformance", region: "US", base: "https://zzperformance.com", platform: "shopify", mixed: true },
  { id: "elitetruck", name: "Elite Truck", region: "US", base: "https://elitetruck.com", platform: "shopify", mixed: true },
  { id: "performancebyie", name: "Integrated Engineering", region: "US", base: "https://performancebyie.com", platform: "shopify" },
  { id: "3wliners", name: "3Wliners", region: "US", base: "https://3wliners.com", platform: "shopify" },
  { id: "valvetronic", name: "Valvetronic Designs", region: "US", base: "https://valvetronic.com", platform: "shopify" },
  { id: "wolfbox", name: "WOLFBOX", region: "US", base: "https://wolfbox.com", platform: "shopify", official: true },
  { id: "mactools", name: "Mac Tools", region: "US", base: "https://www.mactools.com", platform: "shopify", official: true, mixed: true },
  { id: "venommotorsportsusa", name: "Venom Motorsports USA", region: "US", base: "https://venommotorsportsusa.com", platform: "shopify", official: true, mixed: true },
  { id: "batterytender", name: "Battery Tender\u00ae", region: "US", base: "https://batterytender.com", platform: "shopify", official: true },
  { id: "717supply", name: "717 SUPPLY", region: "US", base: "https://717supply.com", platform: "shopify", mixed: true },
  { id: "mucoff", name: "Muc-Off UK", region: "UK", base: "https://muc-off.com", platform: "shopify", official: true, mixed: true },
  { id: "ancel", name: "ANCEL", region: "US", base: "https://ancel.com", platform: "shopify", official: true },
  // Probe round 4 (2026-11-10): storecensus automotive directory.
  { id: "wiperblades", name: "Wiper Blades", region: "UK", base: "https://wiperblades.co.uk", platform: "shopify" },
  { id: "morepowertuning", name: "More Power Tuning", region: "US", base: "https://morepowertuning.com", platform: "shopify" },
  { id: "r44performance", name: "R44 Performance", region: "UK", base: "https://r44performance.com", platform: "shopify" },
  { id: "importimageracing", name: "Import Image Racing", region: "US", base: "https://importimageracing.com", platform: "shopify" },
  { id: "carandtruckremotes", name: "CarandTruckRemotes", region: "US", base: "https://carandtruckremotes.com", platform: "shopify" },
  { id: "hpsperformanceproducts", name: "HPS Performance", region: "US", base: "https://hpsperformanceproducts.com", platform: "shopify" },
  { id: "bmptuning", name: "BMP Tuning", region: "US", base: "https://bmptuning.com", platform: "shopify" },
  { id: "vuduperformance", name: "VUDU Performance", region: "UK", base: "https://vuduperformance.com", platform: "shopify" },
  { id: "paintnship", name: "Paint N Ship", region: "US", base: "https://paintnship.com", platform: "shopify" },
  { id: "midwestbimmersupply", name: "MidWest Bimmer Supply", region: "US", base: "https://midwestbimmersupply.com", platform: "shopify" },
  { id: "partify", name: "Partify Canada", region: "CA", base: "https://partify.ca", platform: "shopify" },
  { id: "tcpglobal", name: "TCP Global", region: "US", base: "https://tcpglobal.com", platform: "shopify" },
  { id: "amtuning", name: "AM Tuning Canada", region: "CA", base: "https://amtuning.ca", platform: "shopify" },
  { id: "speedzoneweb", name: "Speedzone Performance LLC", region: "US", base: "https://speedzone-web.com", platform: "shopify", mixed: true },
  { id: "bayoptiks", name: "Bayoptiks", region: "US", base: "https://bayoptiks.com", platform: "shopify" },
  { id: "coverking", name: "CoverkingUSA", region: "US", base: "https://coverking.com", platform: "shopify", mixed: true },
  { id: "bimmerplug", name: "Bimmer Plug", region: "US", base: "https://bimmerplug.com", platform: "shopify" },
  { id: "partsology", name: "Partsology", region: "US", base: "https://partsology.com", platform: "shopify", mixed: true },
  { id: "autorimshop", name: "Auto Rim Shop", region: "US", base: "https://autorimshop.com", platform: "shopify", mixed: true },
  { id: "autopainthq", name: "Auto Paint HQ", region: "US", base: "https://autopainthq.com", platform: "shopify", mixed: true },
  { id: "caliraisedled", name: "Cali Raised LED", region: "US", base: "https://caliraisedled.com", platform: "shopify" },
  { id: "retromanufacturing", name: "Retro Manufacturing", region: "US", base: "https://retromanufacturing.com", platform: "shopify", mixed: true },
  { id: "tacomalifestyle", name: "Tacoma Lifestyle", region: "US", base: "https://tacomalifestyle.com", platform: "shopify", mixed: true },
  { id: "slrspeed", name: "SLRspeed", region: "US", base: "https://slrspeed.com", platform: "shopify", mixed: true },
  { id: "pitstopusa", name: "Pit Stop USA", region: "US", base: "https://pitstopusa.com", platform: "shopify", mixed: true },
  { id: "sdhqoffroad", name: "SDHQ", region: "US", base: "https://sdhqoffroad.com", platform: "shopify", mixed: true },
  { id: "eliteautogear", name: "Elite Auto Gear", region: "US", base: "https://eliteautogear.com", platform: "shopify", mixed: true },
  { id: "ktecracing", name: "k-tec-ecommerce", region: "UK", base: "https://k-tecracing.com", platform: "shopify", mixed: true },
  { id: "mizumoauto", name: "Mizumo Auto", region: "US", base: "https://mizumoauto.com", platform: "shopify", mixed: true },
  { id: "extremeonlinestore", name: "Extreme Online Store", region: "US", base: "https://extremeonlinestore.com", platform: "shopify", mixed: true },
  { id: "4runnerlifestyle", name: "4Runner Lifestyle", region: "US", base: "https://4runnerlifestyle.com", platform: "shopify", mixed: true },
  { id: "torquegt", name: "Torque GT", region: "UK", base: "https://torque-gt.co.uk", platform: "shopify", mixed: true },
  { id: "darwinproaero", name: "DarwinPRO Aerodynamics", region: "US", base: "https://darwinproaero.com", platform: "shopify", mixed: true },
  { id: "kiesmotorsports", name: "Kies Motorsports", region: "US", base: "https://kiesmotorsports.com", platform: "shopify" },
  { id: "prlmotorsports", name: "PRL Motorsports", region: "US", base: "https://prlmotorsports.com", platform: "shopify" },
  { id: "carsupplieswarehouse", name: "Car Supplies Warehouse", region: "US", base: "https://carsupplieswarehouse.com", platform: "shopify", mixed: true },
  { id: "bebuyby", name: "bebuyby", region: "UK", base: "https://bebuyby.com", platform: "shopify", mixed: true },
  { id: "burgertuning", name: "Burger Motorsports Inc", region: "US", base: "https://burgertuning.com", platform: "shopify" },
  { id: "motionraceworks", name: "Motion Raceworks", region: "US", base: "https://motionraceworks.com", platform: "shopify", mixed: true },
  { id: "aeroflowdynamics", name: "AeroflowDynamics", region: "US", base: "https://aeroflowdynamics.com", platform: "shopify" },
  { id: "alpharexusa", name: "AlphaRex", region: "US", base: "https://alpharexusa.com", platform: "shopify" },
  { id: "subiesupplyco", name: "Subie Supply Co.", region: "CA", base: "https://subiesupplyco.ca", platform: "shopify", mixed: true },
  { id: "f150leds", name: "f150leds.com", region: "US", base: "https://f150leds.com", platform: "shopify" },
  { id: "inddistribution", name: "IND Distribution", region: "US", base: "https://ind-distribution.com", platform: "shopify", mixed: true },
  { id: "rgbhalokits", name: "RGB Halo Kits", region: "US", base: "https://rgbhalokits.com", platform: "shopify", mixed: true },
  { id: "jdcustomsusa", name: "JD Customs U.S.A", region: "US", base: "https://jdcustomsusa.com", platform: "shopify", mixed: true },
  { id: "hirevsports", name: "HIREV SPORTS", region: "US", base: "https://hirevsports.com", platform: "shopify" },
  { id: "issautomotive", name: "ISS Auto", region: "US", base: "https://issautomotive.com", platform: "shopify", mixed: true },
  { id: "ppepower", name: "Pacific Performance Engineering", region: "US", base: "https://ppepower.com", platform: "shopify", mixed: true },
  { id: "nvx", name: "NVX", region: "US", base: "https://nvx.com", platform: "shopify", mixed: true },
  { id: "powerfuluk", name: "Powerful UK", region: "UK", base: "https://powerfuluk.com", platform: "shopify", mixed: true },
  { id: "kimblade", name: "KIMBLADE WIPER", region: "US", base: "https://kimblade.com", platform: "shopify" },
  { id: "kspmotor", name: "KSP Performance", region: "US", base: "https://kspmotor.com", platform: "shopify", mixed: true },
  { id: "carlightbulb", name: "CarLightBulb", region: "UK", base: "https://carlightbulb.com", platform: "shopify" },
  { id: "caautoparts", name: "CA Auto Parts", region: "US", base: "https://caautoparts.com", platform: "shopify", mixed: true },
  { id: "dv8offroad", name: "DV8 Offroad", region: "US", base: "https://dv8offroad.com", platform: "shopify", mixed: true },
  { id: "boostautoparts", name: "Boost Auto", region: "US", base: "https://boostautoparts.com", platform: "shopify", mixed: true },
  { id: "mountunestore", name: "mountune", region: "UK", base: "https://mountunestore.com", platform: "shopify", mixed: true },
  { id: "stingerdrive", name: "Stinger", region: "US", base: "https://stingerdrive.com", platform: "shopify", mixed: true },
];

/** The stores on Shopify: the cart-based checks (shipping quotes, multi-buys) and the checkout link read only these. */
export const SHOPIFY_STORES: Store[] = STORES.filter((s) => s.platform === "shopify");

export const STORE_BY_ID: Record<string, Store> = Object.fromEntries(STORES.map((s) => [s.id, s]));
