import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import HttpApi from "i18next-http-backend";
// Define translations
const resources = {
  en: {
    translation: {
      welcome: "Welcome!",
      selectLanguage: "Select Language",
      logout: "Logout",
      settings: "Settings",
      help: "Help",
      activePolls:
        " Explore the latest active polls and have your say on important topics!.",
      newsInIreland:
        " Breaking news, trending topics, and important updates from across Ireland. Stay informed with the latest headlines!",
      voteRegisteredSuccess: "Vote registered successfully!",
      voteAlreadyCast: "You cannot vote twice in the same poll.",
      readMore: "Read More",
      pollDecidedMessage:
        "The poll has been decided. Please check the results page.",
      pollId: "Poll ID",
      createdBy: "Created By",
      close: "Close",
      loadingNews: "Loading news...",
      newsUnavailable: "News currently unavailable.",
      next: "Next",
      previous: "Previous",
      voted: "Voted",
      poll_results: "Poll Results",
      poll_result_description:
        "This section shows all the polls, that have been approved, reject, or still active.",
      poll_footer_message:
        "These results reflect the current community opinion.",
      yes: "Yes",
      no: "No",
      status_approved: "Approved",
      status_rejected: "Rejected",
      status_active: "Active",
      poll_results2: "Polls you have voted on",
      faq_title: "Frequently Asked Questions",
      faq_how_to_vote: "How do I vote?",
      faq_how_to_vote_answer:
        "To vote in a poll, simply tap on the poll you are interested in, select your preferred option, and confirm your choice. Your vote will be counted instantly!",
      faq_change_vote: "Can I change my vote after submitting it?",
      faq_change_vote_answer:
        "Once you have submitted your vote, you cannot change it. Please make sure to select the option you wish to vote for before confirming.",
      faq_new_polls: "How often are new polls added?",
      faq_new_polls_answer:
        "New polls are added regularly to cover a wide range of topics and issues. Check back frequently to have your say on the latest polls!",
      faq_view_results: "How can I view the results of a poll?",
      faq_view_results_answer:
        "You can view poll results by selecting RESULT PAGE. The results will be displayed in an easy-to-read format, showing the percentage of votes for each option.",
      faq_anonymous_vote: "Is my vote anonymous?",
      faq_anonymous_vote_answer:
        "Yes, all votes are anonymous and confidential. Your vote will not be shared with anyone, and your privacy is protected.",
      faq_change_language: "How can I change the app language?",
      faq_change_language_answer:
        "You can change the app language by going to PROFILE and selecting your preferred language from the list of available options.",
      faq_who_creates_polls: "Who creates the polls?",
      faq_who_creates_polls_answer:
        "Polls are created by the app administrators and moderators. They cover a variety of topics and issues to gather opinions from the community.",
      nav_home: "Home",
      nav_completed_polls: "Completed Polls",
      nav_result_page: "Result Page",
      nav_profile: "Settings/Profile",
      contact_header: "Do you have problems? We're here to help!",
      your_name: "Your Name",
      select_issue: "Select an issue",
      technical_issue: "Technical Issue",
      polls_issue: "Polls Issue",
      account_issue: "Account Issue",
      other_issue: "Other",
      describe_issue: "Describe your issue...",
      attach_image: "Attach Image",
      submit: "Submit",
      submitting: "Submitting...",
      thanks_for_contacting:
        "Thanks for contacting us! We will reach out soon.",
      error: "Error",
      select_issue_description:
        "Please select an issue type and provide a description.",
      submission_failed: "Something went wrong, please try again.",
      contactUs: "Contact Us",
      mheader: "Messages",
      msheader: "This section shows all the conversations you have with the admin and moderators regards any issue with the application or general.",
      Admin_Enquiries: "Admin Enquiry",
    },
  },
  es: {
    translation: {
      welcome: "¡Bienvenido!",
      selectLanguage: "Seleccionar idioma",
      logout: "Cerrar sesión",
      settings: "Configuraciones",
      help: "Ayuda",
      activePolls:
        " ¡Explora las últimas encuestas activas y da tu opinión sobre temas importantes!.",
      newsInIreland:
        "  Últimas noticias, temas de tendencia y actualizaciones importantes de toda Irlanda. ¡Mantente informado con los titulares más recientes!",
      voteRegisteredSuccess: "¡Voto registrado con éxito!",
      voteAlreadyCast: "No puedes votar dos veces en la misma encuesta.",
      readMore: "Lee mas",
      pollDecidedMessage:
        "La encuesta ha sido decidida. Por favor, consulte la página de resultados.",
      pollId: "ID de la encuesta",
      createdBy: "Creado por",
      close: "Cerrar",
      loadingNews: "Cargando noticias...",
      newsUnavailable: "Noticias actualmente no disponibles.",
      next: "Siguiente",
      previous: "Anterior",
      voted: "Votado",
      poll_results: "Resultados de la Encuesta",
      poll_result_description:
        "Esta sección muestra todas las encuestas, que han sido aprobadas, rechazadas o aún activas.",
      poll_footer_message:
        "Estos resultados reflejan la opinión actual de la comunidad.",
      yes: "Sí",
      no: "No",
      status_approved: "Aprobado",
      status_rejected: "Rechazado",
      status_active: "Activo",
      poll_results2: "Encuestas en las que has votado",
      faq_title: "Preguntas Frecuentes",
      faq_how_to_vote: "¿Cómo puedo votar?",
      faq_how_to_vote_answer:
        "Para votar en una encuesta, simplemente toca la encuesta que te interesa, selecciona tu opción preferida y confirma tu elección. ¡Tu voto se contará al instante!",
      faq_change_vote: "¿Puedo cambiar mi voto después de enviarlo?",
      faq_change_vote_answer:
        "Una vez que hayas enviado tu voto, no podrás cambiarlo. Asegúrate de seleccionar la opción que deseas votar antes de confirmar.",
      faq_new_polls: "¿Con qué frecuencia se añaden nuevas encuestas?",
      faq_new_polls_answer:
        "Se agregan nuevas encuestas regularmente para cubrir una amplia gama de temas y cuestiones. ¡Vuelve a consultar con frecuencia para expresar tu opinión en las últimas encuestas!",
      faq_view_results: "¿Cómo puedo ver los resultados de una encuesta?",
      faq_view_results_answer:
        "Puedes ver los resultados de las encuestas seleccionando la PÁGINA DE RESULTADOS. Los resultados se mostrarán en un formato fácil de leer, mostrando el porcentaje de votos para cada opción.",
      faq_anonymous_vote: "¿Mi voto es anónimo?",
      faq_anonymous_vote_answer:
        "Sí, todos los votos son anónimos y confidenciales. Tu voto no se compartirá con nadie y tu privacidad está protegida.",
      faq_change_language: "¿Cómo puedo cambiar el idioma de la aplicación?",
      faq_change_language_answer:
        "Puedes cambiar el idioma de la aplicación yendo a PERFIL y seleccionando tu idioma preferido de la lista de opciones disponibles.",
      faq_who_creates_polls: "¿Quién crea las encuestas?",
      faq_who_creates_polls_answer:
        "Las encuestas son creadas por los administradores y moderadores de la aplicación. Cubren una variedad de temas y cuestiones para recopilar opiniones de la comunidad.",
      nav_home: "Inicio",
      nav_completed_polls: "Encuestas Completadas",
      nav_result_page: "Resultados",
      nav_profile: "Configuración/Perfil",
      contact_header: "¿Tienes problemas? ¡Estamos aquí para ayudarte!",
      your_name: "Tu Nombre",
      select_issue: "Selecciona un problema",
      technical_issue: "Problema técnico",
      polls_issue: "Problema con las encuestas",
      account_issue: "Problema con la cuenta",
      other_issue: "Otro",
      describe_issue: "Describe tu problema...",
      attach_image: "Adjuntar imagen",
      submit: "Enviar",
      submitting: "Enviando...",
      thanks_for_contacting:
        "¡Gracias por contactarnos! Nos pondremos en contacto pronto.",
      error: "Error",
      select_issue_description:
        "Por favor, selecciona un tipo de problema y proporciona una descripción.",
      submission_failed: "Algo salió mal, por favor intenta de nuevo.",
      contactUs: "Contáctenos",
      mheader: "Mensajes",
      msheader: " Esta sección muestra todas las conversaciones que tienes con el administrador y los moderadores con respecto a cualquier problema con la aplicación o en general.",
    },
    Admin_Enquiries: "Consultas de administrador",
  },
  fr: {
    translation: {
      welcome: "Bienvenue!",
      selectLanguage: "Choisir la langue",
      logout: "Se déconnecter",
      settings: "Paramètres",
      help: "Aide",
      activePolls:
        " Explorez les derniers sondages actifs et donnez votre avis sur des sujets importants !.",
      newsInIreland:
        "  Dernières nouvelles, sujets tendance et mises à jour importantes de toute l'Irlande. Restez informé avec les derniers titres !",
      voteRegisteredSuccess: "Vote enregistré avec succès!",
      voteAlreadyCast:
        "Vous ne pouvez pas voter deux fois dans le même sondage.",
      readMore: "Lire la suite",
      pollDecidedMessage:
        "Le sondage a été décidé. Veuillez consulter la page des résultats.",
      pollId: "ID du sondage",
      createdBy: "Créé par",
      close: "Fermer",
      loadingNews: "Chargement des actualités...",
      newsUnavailable: "Actualités actuellement indisponibles.",
      next: "Suivant",
      previous: "Précédent",
      voted: "Voté",
      poll_results: "Résultats du Sondage",
      poll_result_description:
        "Cette section montre tous les sondages, qui ont été approuvés, rejetés ou encore actifs.",
      poll_footer_message:
        "Ces résultats reflètent l'opinion actuelle de la communauté.",
      yes: "Oui",
      no: "Non",
      status_approved: "Approuvé",
      status_rejected: "Rejeté",
      status_active: "Actif",
      poll_results2: "Sondages auxquels vous avez voté",
      faq_title: "Questions Fréquemment Posées",
      faq_how_to_vote: "Comment voter ?",
      faq_how_to_vote_answer:
        "Pour voter dans un sondage, appuyez simplement sur le sondage qui vous intéresse, sélectionnez votre option préférée et confirmez votre choix. Votre vote sera comptabilisé instantanément !",
      faq_change_vote: "Puis-je changer mon vote après l'avoir soumis ?",
      faq_change_vote_answer:
        "Une fois que vous avez soumis votre vote, vous ne pouvez pas le modifier. Assurez-vous de choisir l'option souhaitée avant de confirmer.",
      faq_new_polls:
        "À quelle fréquence de nouveaux sondages sont-ils ajoutés ?",
      faq_new_polls_answer:
        "De nouveaux sondages sont ajoutés régulièrement pour couvrir une large gamme de sujets et de questions. Revenez souvent pour donner votre avis sur les derniers sondages !",
      faq_view_results: "Comment puis-je voir les résultats d'un sondage ?",
      faq_view_results_answer:
        "Vous pouvez consulter les résultats des sondages en sélectionnant la PAGE DES RÉSULTATS. Les résultats s'afficheront sous un format facile à lire, montrant le pourcentage de votes pour chaque option.",
      faq_anonymous_vote: "Mon vote est-il anonyme ?",
      faq_anonymous_vote_answer:
        "Oui, tous les votes sont anonymes et confidentiels. Votre vote ne sera partagé avec personne et votre confidentialité est protégée.",
      faq_change_language:
        "Comment puis-je changer la langue de l'application ?",
      faq_change_language_answer:
        "Vous pouvez changer la langue de l'application en allant dans PROFIL et en sélectionnant votre langue préférée dans la liste des options disponibles.",
      faq_who_creates_polls: "Qui crée les sondages ?",
      faq_who_creates_polls_answer:
        "Les sondages sont créés par les administrateurs et modérateurs de l'application. Ils couvrent divers sujets et questions pour recueillir les opinions de la communauté.",
      nav_home: "Accueil",
      nav_completed_polls: "Sondages Complétés",
      nav_result_page: "Résultats",
      nav_profile: "Paramètres/Profil",
      contact_header:
        "Avez-vous des problèmes ? Nous sommes là pour vous aider !",
      your_name: "Votre Nom",
      select_issue: "Sélectionnez un problème",
      technical_issue: "Problème technique",
      polls_issue: "Problème avec les sondages",
      account_issue: "Problème de compte",
      other_issue: "Autre",
      describe_issue: "Décrivez votre problème...",
      attach_image: "Joindre une image",
      submit: "Envoyer",
      submitting: "Envoi...",
      thanks_for_contacting:
        "Merci de nous avoir contactés ! Nous vous répondrons bientôt.",
      error: "Erreur",
      select_issue_description:
        "Veuillez sélectionner un type de problème et fournir une description.",
      submission_failed: "Quelque chose s'est mal passé, veuillez réessayer.",
      contactUs: "Contactez-nous",
      mheader: "Messages",
      msheader: "Cette section montre toutes les conversations que vous avez avec l'administrateur et les modérateurs concernant tout problème avec l'application ou en général.",
      Admin_Enquiries: "Demandes d'informations administratives",
    },
  },
};

// Get the device language
const getDeviceLanguage = () => Localization.locale.split("-")[0] || "en";

// Initialize i18n
i18n
  .use(initReactI18next)
  .use(HttpApi)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    backend: {
      loadPath:
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={{lng}}&dt=t&q={{text}}", // Uses Google Translate API
    },
  });

// Function to change language and force re-render
export const changeLanguage = async (lang: string) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem("appLanguage", lang);
};

// Function to load the saved language
export const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem("appLanguage");
  if (savedLanguage) {
    await i18n.changeLanguage(savedLanguage);
  }
};

export default i18n;
