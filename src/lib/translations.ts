export const translations = {
  en: {
    // Login Page
    signInPrompt: 'Sign in to access your AI assistant',
    otpPrompt: 'Enter the OTP sent to your email',
    emailLabel: 'Email Address',
    otpLabel: 'One-Time Password',
    sendOtpButton: 'Send OTP',
    signInButton: 'Sign In & Start Chatting',
    backToEmailButton: 'Back to email entry',
    otpSentTitle: 'OTP Sent!',
    otpSentDescription: 'A 6-digit code has been sent to',
    loginSuccessTitle: 'Login Successful!',
    loginFailedTitle: 'Login Failed',
    loginFailedDescription: 'The OTP you entered is incorrect. Please try again.',

    // Header
    changeLanguage: 'Change Language',
    notifications: 'Notifications',
    notification1Title: 'Exam Schedule Published',
    notification1Body: 'The schedule for the upcoming semester exams is now available on the portal.',
    notification2Title: 'Campus Fest "Udbhav"',
    notification2Body: 'Get ready for our annual cultural fest starting next week!',
    logout: 'Logout',
    faq: 'FAQs',
    faqTitle: 'Frequently Asked Questions',

    // Chat Interface
    welcomeMessage: 'Hello! I am Brainware Buddy. How can I assist you today?',
    inputPlaceholder: 'Ask me anything about Brainware University...',
    errorMessage: 'I am sorry, but I encountered an error. Please try asking again.',
    escalationReason: "I couldn't find a definitive answer and your query seems complex",
    escalationPrompt: 'Would you like me to connect you to a human representative for further assistance?',
    voiceErrorTitle: 'Voice Recognition Error',
    voiceErrorDescription: 'Could not start voice recognition. Please check your microphone permissions.',
  },
  bn: {
    // Login Page
    signInPrompt: 'আপনার এআই সহকারীতে অ্যাক্সেস করতে সাইন ইন করুন',
    otpPrompt: 'আপনার ইমেলে পাঠানো ওটিপি লিখুন',
    emailLabel: 'ইমেল ঠিকানা',
    otpLabel: 'ওয়ান-টাইম পাসওয়ার্ড',
    sendOtpButton: 'ওটিপি পাঠান',
    signInButton: 'সাইন ইন করুন এবং চ্যাট শুরু করুন',
    backToEmailButton: 'ইমেল এন্ট্রিতে ফিরে যান',
    otpSentTitle: 'ওটিপি পাঠানো হয়েছে!',
    otpSentDescription: 'একটি ৬-সংখ্যার কোড পাঠানো হয়েছে',
    loginSuccessTitle: 'লগইন সফল!',
    loginFailedTitle: 'লগইন ব্যর্থ হয়েছে',
    loginFailedDescription: 'আপনি যে ওটিপি প্রবেশ করেছেন তা ভুল। আবার চেষ্টা করুন।',

    // Header
    changeLanguage: 'ভাষা পরিবর্তন করুন',
    notifications: 'বিজ্ঞপ্তি',
    notification1Title: 'পরীক্ষার সময়সূচী প্রকাশিত হয়েছে',
    notification1Body: 'আসন্ন সেমিস্টার পরীক্ষার সময়সূচী এখন পোর্টালে উপলব্ধ।',
    notification2Title: 'ক্যাম্পাস ফেস্ট "উদ্ভব"',
    notification2Body: 'আগামী সপ্তাহ থেকে শুরু হচ্ছে আমাদের বার্ষিক সাংস্কৃতিক উৎসব!',
    logout: 'লগ আউট',
    faq: 'সাধারণ প্রশ্নাবলী',
    faqTitle: 'সাধারণ প্রশ্নাবলী',

    // Chat Interface
    welcomeMessage: 'নমস্কার! আমি ব্রেনওয়্যার বাডি। আমি আপনাকে কিভাবে সাহায্য করতে পারি?',
    inputPlaceholder: 'ব্রেনওয়্যার বিশ্ববিদ্যালয় সম্পর্কে কিছু জিজ্ঞাসা করুন...',
    errorMessage: 'আমি দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার জিজ্ঞাসা করার চেষ্টা করুন।',
    escalationReason: 'আমি একটি নির্দিষ্ট উত্তর খুঁজে পাইনি এবং আপনার প্রশ্নটি জটিল বলে মনে হচ্ছে',
    escalationPrompt: 'আপনি কি চান আমি আপনাকে আরও সহায়তার জন্য একজন প্রতিনিধির সাথে সংযুক্ত করি?',
    voiceErrorTitle: 'ভয়েস রিকগনিশন ত্রুটি',
    voiceErrorDescription: 'ভয়েস রিকগনিশন শুরু করা যায়নি। অনুগ্রহ করে আপনার মাইক্রোফোন অনুমতি পরীক্ষা করুন।',
  },
};

export type TranslationKey = keyof typeof translations.en;
