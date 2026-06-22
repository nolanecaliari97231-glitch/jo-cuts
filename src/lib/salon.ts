export type ServiceItem = {
  name: string;
  description: string;
  duration: string;
  price: string;
};

export type ServiceCategory = {
  name: string;
  services: ServiceItem[];
};

export type OpeningHour = {
  day: string;
  hours: string;
  closed?: boolean;
};

export type GalleryImage = {
  id?: string;
  src: string;
  alt: string;
  title: string;
  /** Point de cadrage CSS object-position (ex. "50% 38%") */
  focus?: string;
};

export type PaymentMethod = {
  id: string;
  label: string;
  description: string;
  available?: boolean;
};

/** Coordonnées privées — envoyées au client uniquement après validation du RDV. */
export const privateSalonLocation = {
  mapsLink: "https://maps.google.com/?q=14.654675,-60.930443",
  latitude: 14.654675,
  longitude: -60.930443,
} as const;

export const salon = {
  name: "JO'Cuts",
  region: "Martinique",
  pitch:
    "Barbershop soigné en Martinique. Coupes courtes homme et femme, barbes, dégradés et déplacement à domicile — sur rendez-vous.",
  openingHoursNote:
    "Pause déjeuner de 12h à 12h30. Fermé le samedi. Pas de prestations le vendredi soir.",
  serviceScope:
    "Dégradé, taper, burst fade et toutes coupes sur cheveux courts — homme ou femme. Pas de teinture, soins capillaires ni shampooing (matériel non disponible).",
  appointmentTimingNote:
    "Les durées affichées sont indicatives et peuvent varier selon la prestation. Les rendez-vous sont planifiés par créneaux de 30 minutes : une légère attente peut être nécessaire si la coupe demande plus de temps.",
  phone: "0696 76 56 06",
  phoneHref: "tel:+596696765606",
  email: "237barber.contact@gmail.com",
  emailHref: "mailto:237barber.contact@gmail.com",
  instagram: {
    handle: "@237barber",
    url: "https://instagram.com/237barber",
  },
  locationPolicy:
    "L'adresse exacte n'est pas affichée sur le site. Elle vous est communiquée automatiquement lorsque votre rendez-vous est confirmé.",
  appointmentModes: {
    atBarber: {
      label: "Chez le barbier",
      description:
        "Pour l'instant, les prestations ont lieu au domicile du barbier en Martinique. L'adresse et le lien Google Maps vous sont envoyés après validation de votre rendez-vous.",
    },
    atHome: {
      label: "À domicile",
      description:
        "Le barbier se déplace chez vous. Indiquez votre commune lors de la demande : il reçoit une notification et fixe lui-même le supplément de déplacement avant confirmation.",
    },
  },
  paymentMethods: [
    {
      id: "cash",
      label: "Espèces sur place",
      description: "Paiement en espèces le jour du rendez-vous.",
      available: true,
    },
    {
      id: "card",
      label: "Carte bancaire sur place (SumUp)",
      description: "Paiement par carte sur le terminal SumUp du barbier, le jour du rendez-vous.",
      available: true,
    },
  ] satisfies PaymentMethod[],
  openingHours: [
    { day: "Lundi", hours: "7h – 12h · 12h30 – 17h" },
    { day: "Mardi", hours: "7h – 12h · 12h30 – 17h" },
    { day: "Mercredi", hours: "7h – 12h · 12h30 – 17h" },
    { day: "Jeudi", hours: "7h – 12h · 12h30 – 17h" },
    { day: "Vendredi", hours: "7h – 12h · 12h30 – 17h" },
    { day: "Samedi", hours: "Fermé", closed: true },
    { day: "Dimanche", hours: "7h – 12h · 12h30 – 17h" },
  ] satisfies OpeningHour[],
} as const;

export const serviceCategories: ServiceCategory[] = [
  {
    name: "Coupe homme",
    services: [
      {
        name: "Coupe classique",
        description:
          "Coupe soignée adaptée à votre style et à la forme de votre visage — dégradé, taper, burst fade et finitions sur cheveux courts.",
        duration: "30 min",
        price: "15",
      },
    ],
  },
  {
    name: "Coupe enfant",
    services: [
      {
        name: "Coupe enfant",
        description: "Coupe adaptée aux plus jeunes, dans une ambiance accueillante.",
        duration: "40 min",
        price: "15",
      },
    ],
  },
  {
    name: "Barbe",
    services: [
      {
        name: "Taille de barbe",
        description: "Contours, mise en forme et entretien de la barbe.",
        duration: "15 min",
        price: "5",
      },
    ],
  },
  {
    name: "Combo",
    services: [
      {
        name: "Coupe + barbe",
        description: "Formule complète pour un look harmonieux de la tête aux contours.",
        duration: "40–45 min",
        price: "20",
      },
    ],
  },
];

export const featuredServices = serviceCategories.flatMap((category) =>
  category.services.slice(0, 1).map((service) => ({
    ...service,
    category: category.name,
  })),
);

export const galleryImages: GalleryImage[] = [
  { src: "/images/gallery/01.png", alt: "Taper fade en extérieur", title: "Taper fade", focus: "50% 42%" },
  { src: "/images/gallery/02.png", alt: "Coupe enfant dégradé", title: "Coupe enfant", focus: "55% 40%" },
  { src: "/images/gallery/03.png", alt: "Design géométrique sur le côté", title: "Design géométrique", focus: "60% 45%" },
  { src: "/images/gallery/04.png", alt: "Locs sectionnés et fade", title: "Locs & fade", focus: "55% 38%" },
  { src: "/images/gallery/05.png", alt: "Taper fade et line-up", title: "Line-up précis", focus: "50% 35%" },
  { src: "/images/gallery/06.png", alt: "Design structuré fade", title: "Design sur mesure", focus: "58% 48%" },
  { src: "/images/gallery/07.png", alt: "Motif artistique dans les cheveux", title: "Motif artistique", focus: "50% 50%" },
  { src: "/images/gallery/08.png", alt: "Fade profil net", title: "Fade profil", focus: "55% 40%" },
  { src: "/images/gallery/09.png", alt: "Dégradé et contours", title: "Dégradé net", focus: "50% 38%" },
  { src: "/images/gallery/10.png", alt: "Fade et barbe sculptée", title: "Fade & barbe", focus: "50% 40%" },
  { src: "/images/gallery/11.png", alt: "Coupe profil avec fade", title: "Profil fade", focus: "55% 42%" },
  { src: "/images/gallery/12.png", alt: "Waves et dégradé", title: "Waves & fade", focus: "50% 38%" },
  { src: "/images/gallery/13.png", alt: "Waves, barbe et line-up", title: "Waves & barbe", focus: "50% 38%" },
  { src: "/images/gallery/14.png", alt: "Waves et barbe finition miroir", title: "Finition barbe", focus: "50% 38%" },
];

export const bookingSteps = [
  "Choisir un service et le lieu (chez le barbier ou à domicile)",
  "Sélectionner un créneau disponible",
  "Renseigner vos coordonnées — et votre commune si prestation à domicile",
  "Choisir le paiement sur place : espèces ou carte (terminal SumUp)",
  "Validation — adresse ou supplément déplacement confirmé par le barbier",
] as const;
