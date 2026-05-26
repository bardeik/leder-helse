export interface WorkoutExercise {
  id: number;
  name: string;
  description: string;
  videoUrl: string;
}

export const exercises: WorkoutExercise[] = [
  {
    id: 1,
    name: "Knebøy",
    description:
      "Styrker underkroppen og kjernen. Senk deg kontrollert ned som om du setter deg på en stol, og reis deg opp igjen.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=603&env=production"
  },
  {
    id: 2,
    name: "Pushups",
    description:
      "Styrker bryst, armer, skuldre og kjerne. Utfør på tær eller knær med rett kropp og aktiv kjernemuskulatur.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=13822&env=production"
  },
  {
    id: 3,
    name: "Bulgarske utfall",
    description:
      "Styrker underkroppen ett ben av gangen. Hold bakerste fot på benk/stol, senk kontrollert ned og press opp.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=12746&env=production"
  },
  {
    id: 4,
    name: "Rygghev",
    description: "Styrker ryggstrekkerne. Ligg på magen, løft lett overkropp og ben, og før armene som et svømmetak.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=9441&env=production"
  },
  {
    id: 5,
    name: "Step-up",
    description: "Styrker ben og øker pulsen. Gå kontrollert opp og ned på benk eller step, og bytt ben jevnlig.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=3922&env=production"
  },
  {
    id: 6,
    name: "Dips",
    description: "Styrker overarmer, skuldre og øvre rygg. Bruk stol eller benk, senk kroppen kontrollert og press opp.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=13610&env=production"
  },
  {
    id: 7,
    name: "Deadbug",
    description:
      "Styrker dype magemuskler. Hold korsryggen i bakken mens du senker ett ben av gangen, gjerne med motsatt arm.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=11481&env=production"
  },
  {
    id: 8,
    name: "Sidehopp",
    description: "Trener spenst og underkropp. Hopp side til side med myk landing og god kontroll i knær og hofter.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=14166&env=production"
  },
  {
    id: 9,
    name: "Planke med vri",
    description:
      "Styrker mage, sidemage og øvre rygg. Stå i plankeposisjon på albuer og roter hoften kontrollert side til side.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercise=10320&env=production"
  }
];

export const SAMLET_VIDEO_URL =
  "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercises=Ils2MDMsMTM4MjIsMTI3NDYsOTQ0MSwzOTIyLDEzNjEwLDExNDgxLDE0MTY2LDEwMzIwXSI&env=production";

