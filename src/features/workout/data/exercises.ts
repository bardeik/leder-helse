import type { Locale } from "@/i18n/types";

export interface WorkoutExercise {
  id: number;
  name: string;
  description: string;
  videoUrl: string;
}

const norwegianExercises: WorkoutExercise[] = [
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

const englishExercises: WorkoutExercise[] = [
  {
    id: 1,
    name: "Squat",
    description:
      "Strengthens the lower body and core. Lower yourself in a controlled way as if sitting on a chair, then stand back up.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=603&env=production"
  },
  {
    id: 2,
    name: "Pushups",
    description:
      "Strengthens the chest, arms, shoulders, and core. Do them on your toes or knees with a straight body and active core.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=13822&env=production"
  },
  {
    id: 3,
    name: "Bulgarian split squats",
    description:
      "Strengthens the lower body one leg at a time. Keep the back foot on a bench or chair, lower in a controlled way, and press up.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=12746&env=production"
  },
  {
    id: 4,
    name: "Back extensions",
    description:
      "Strengthens the spinal erectors. Lie on your stomach, lift your upper body and legs slightly, and move your arms like a swimming stroke.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=9441&env=production"
  },
  {
    id: 5,
    name: "Step-up",
    description:
      "Strengthens the legs and raises the heart rate. Step up and down on a bench or step in a controlled way and switch legs regularly.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=3922&env=production"
  },
  {
    id: 6,
    name: "Dips",
    description:
      "Strengthens the upper arms, shoulders, and upper back. Use a chair or bench, lower your body in a controlled way, and press up.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=13610&env=production"
  },
  {
    id: 7,
    name: "Dead bug",
    description:
      "Strengthens the deep abdominal muscles. Keep your lower back on the floor while lowering one leg at a time, ideally with the opposite arm.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=11481&env=production"
  },
  {
    id: 8,
    name: "Side jumps",
    description:
      "Trains power and the lower body. Jump side to side with a soft landing and good control in the knees and hips.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=14166&env=production"
  },
  {
    id: 9,
    name: "Plank with twist",
    description:
      "Strengthens the abs, obliques, and upper back. Hold a plank on your forearms and rotate the hips side to side in a controlled way.",
    videoUrl: "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercise=10320&env=production"
  }
];

export const exercises = norwegianExercises;

export function getExercises(locale: Locale): WorkoutExercise[] {
  return locale === "en" ? englishExercises : norwegianExercises;
}

export const SAMLET_VIDEO_URL =
  "https://mediaserver.exorlive.com/videoplayer?culture=nb-no&exercises=Ils2MDMsMTM4MjIsMTI3NDYsOTQ0MSwzOTIyLDEzNjEwLDExNDgxLDE0MTY2LDEwMzIwXSI&env=production";

export function getWorkoutSummaryVideoUrl(locale: Locale): string {
  return locale === "en"
    ? "https://mediaserver.exorlive.com/videoplayer?culture=en-us&exercises=Ils2MDMsMTM4MjIsMTI3NDYsOTQ0MSwzOTIyLDEzNjEwLDExNDgxLDE0MTY2LDEwMzIwXSI&env=production"
    : SAMLET_VIDEO_URL;
}
