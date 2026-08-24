import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "home": "Home",
      "shop": "Our Products",
      "about": "About Us",
      "contact": "Contact Us",
      "my_orders": "My Orders",
      "wishlist": "Wishlist",
      "login": "Login",
      "register": "Register",
      "cart": "Cart",
      "profile": "Profile",
      "admin": "Admin",
      "hero_title": "Traditional Taste. Natural Ingredients. Authentic Food.",
      "hero_subtitle": "Experience the tradition of premium Indian traditional foods crafted with care.",
      "shop_now": "Shop Now",
      "explore_products": "Explore Products",
      "featured_products": "Featured Products",
      "add_to_cart": "Add to Cart",
      "order_now": "Order Now",
      "buy_on_whatsapp": "Buy on WhatsApp",
      "checkout": "Checkout",
      "total": "Total",
      "order_success": "Order placed successfully!",
      "your_cart_is_empty": "Your cart is empty",
      "price": "Price",
      "quantity": "Quantity",
      "variant": "Variant",
      "place_order": "Place Order",
      "name": "Full Name",
      "phone": "Phone Number",
      "address": "Delivery Address"
    }
  },
  hi: {
    translation: {
      "home": "होम",
      "shop": "हमारे उत्पाद",
      "about": "हमारे बारे में",
      "contact": "संपर्क करें",
      "my_orders": "मेरे ऑर्डर",
      "wishlist": "विशलिस्ट",
      "login": "लॉग इन",
      "register": "रजिस्टर",
      "cart": "कार्ट",
      "profile": "प्रोफ़ाइल",
      "admin": "व्यवस्थापक",
      "hero_title": "असली घरेलू स्वाद",
      "hero_subtitle": "शुद्ध, बिना प्रिजर्वेटिव वाले अचार और पापड़ की परंपरा का अनुभव करें।",
      "shop_now": "अभी खरीदें",
      "featured_products": "विशेष उत्पाद",
      "add_to_cart": "कार्ट में डालें",
      "order_now": "अभी ऑर्डर करें",
      "buy_on_whatsapp": "व्हाट्सएप पर खरीदें",
      "checkout": "चेकआउट",
      "total": "कुल",
      "order_success": "ऑर्डर सफलतापूर्वक दिया गया!",
      "your_cart_is_empty": "आपका कार्ट खाली है",
      "price": "कीमत",
      "quantity": "मात्रा",
      "variant": "प्रकार",
      "place_order": "ऑर्डर करें",
      "name": "पूरा नाम",
      "phone": "फ़ोन नंबर",
      "address": "डिलीवरी का पता"
    }
  },
  mr: {
    translation: {
      "home": "मुखपृष्ठ",
      "shop": "आमची उत्पादने",
      "about": "आमच्याबद्दल",
      "contact": "संपर्क साधा",
      "my_orders": "माझे ऑर्डर्स",
      "wishlist": "विशलिस्ट",
      "login": "लॉगिन",
      "register": "नोंदणी",
      "cart": "कार्ट",
      "profile": "प्रोफाईल",
      "admin": "प्रशासक",
      "hero_title": "अस्सल घरगुती चव",
      "hero_subtitle": "शुद्ध, प्रिझर्व्हेटिव्ह-मुक्त लोणचे आणि पापडांची परंपरा अनुभवा.",
      "shop_now": "आता खरेदी करा",
      "featured_products": "वैशिष्ट्यीकृत उत्पादने",
      "add_to_cart": "कार्टमध्ये जोडा",
      "order_now": "आता ऑर्डर करा",
      "buy_on_whatsapp": "व्हॉट्सॲपवर खरेदी करा",
      "checkout": "चेकआउट",
      "total": "एकूण",
      "order_success": "ऑर्डर यशस्वीरित्या दिली!",
      "your_cart_is_empty": "तुमची कार्ट रिकामी आहे",
      "price": "किंमत",
      "quantity": "प्रमाण",
      "variant": "प्रकार",
      "place_order": "ऑर्डर करा",
      "name": "पूर्ण नाव",
      "phone": "फोन नंबर",
      "address": "वितरण पत्ता"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
