import { Exercise, ExerciseProgram, LevelInfo } from "../../types/exercise";

const level1Exercises: Exercise[] = [
  // ---------------- Lower back ----------------
  {
    id: "hamstringStretch",
    name: "Hamstring Stretch",
    region: ["lower"],
    indicatedFor: "general stiffness, tight hamstrings, lower back, early-stage recovery, flexion-tolerant",
    description:
      "Lie on your back. Lift one leg straight up, looping a towel around your toes if it helps. Gently pull the towel to bring your leg toward you, keeping the other leg flat on the floor. Hold, then switch sides.",
    purpose:
      "Tight hamstrings pull on your pelvis and are a common hidden contributor to lower back strain. This stretches them out without putting any load on your spine.",
    videoUrl: null,
    sets: 3,
    reps: 1,
    holdSeconds: 10,
  },
  {
    id: "kneeToChest",
    name: "Knee-to-Chest Stretch",
    region: ["lower"],
    indicatedFor: "flexion-tolerant pain, general stiffness, lower back, tight hips and glutes",
    description:
      "Lying on your back, gently pull one knee toward your chest with both hands. Hold, then switch legs.",
    purpose:
      "Relieves compression in the lower spine and stretches tight hip and glute muscles that often contribute to back pain.",
    videoUrl: null,
    sets: 2,
    reps: 8,
    holdSeconds: 20,
  },
  {
    id: "pronePressUp",
    name: "Gentle Prone Press-Up",
    region: ["lower"],
    indicatedFor: "extension-biased pain, worse with standing, early-stage recovery, lower back",
    description:
      "Lie face down. Prop yourself up on your forearms, keeping your hips and lower body relaxed on the floor. Only rise as far as feels comfortable — this is a small, gentle movement, not a deep backbend.",
    purpose:
      "A gentle counter-movement for pain that's worse with prolonged standing or arching backward. Keeping the range small and controlled makes it appropriate even early in recovery.",
    videoUrl: null,
    sets: 2,
    reps: 6,
    holdSeconds: 5,
  },

  // ---------------- Mid back ----------------
  {
    id: "thoracicExtensionChair",
    name: "Thoracic Extension Over Chair",
    region: ["mid"],
    indicatedFor: "mid back stiffness, rounded posture, sitting-related pain, upper or mid back",
    description:
      "Sitting or lying with support behind your mid-back (a rolled towel or the edge of a chair works well), gently lean back to extend through your upper-mid spine, then return to neutral.",
    purpose:
      "Mid-back stiffness from sitting often gets compensated for by the lower back — this directly restores mobility where it's actually needed.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: null,
  },
  {
    id: "supine9090Rotation",
    name: "Supine 90/90 Spinal Rotation",
    region: ["mid", "lower"],
    indicatedFor: "mid back, rotational stiffness, general stiffness, low-impact",
    description:
      "Lie on your back with arms stretched out to the sides. Bend your knees to 90 degrees and bring your feet up so your knees and hips are also at 90 degrees. Slowly drop both knees to one side, hold, then bring them back to center and drop to the other side.",
    purpose:
      "Restores rotational mobility in the mid-back in a fully supported position — gentler and more controlled than standing rotations, which makes it a good starting point.",
    videoUrl: null,
    sets: 2,
    reps: 6,
    holdSeconds: 10,
  },
  {
    id: "tennisBallRelease",
    name: "Tennis Ball Wall Release",
    region: ["mid", "upper"],
    indicatedFor: "muscular tension, mid back, knots or tightness, general stiffness",
    description:
      "Place a tennis ball between your back and a wall, just beside your spine (never directly on it). Gently lean into the ball and move slowly to find and release tight spots.",
    purpose:
      "A simple way to release tight muscles around the mid-back. Keeping the ball beside the spine rather than on it targets the muscle, not the spine itself.",
    videoUrl: null,
    sets: 1,
    reps: 1,
    holdSeconds: 60,
  },
  {
    id: "kneelingLatStretch",
    name: "Kneeling Lat Stretch",
    region: ["mid"],
    indicatedFor: "mid back, lats, general stiffness, post-sitting tightness",
    description:
      "Start on your hands and knees, then walk your hands forward well past your head. Sit your hips back toward your heels and let your chest drop gently toward the floor, keeping your back long rather than rounding.",
    purpose:
      "Stretches the lats and mid-back in a safe, supported position — a common spot for tightness that doesn't get addressed by most generic back stretches.",
    videoUrl: null,
    sets: 2,
    reps: 1,
    holdSeconds: 30,
  },

  // ---------------- Upper back ----------------
  {
    id: "wallAngels",
    name: "Wall Angels",
    region: ["upper"],
    indicatedFor: "upper back, rounded shoulders, desk-related pain, general stiffness",
    description:
      "Stand with your back against a wall, arms out in a goalpost position touching the wall. Slowly slide your arms upward and back down, keeping as much contact with the wall as you can.",
    purpose:
      "Opens up the chest and activates the upper back muscles that counteract rounded, hunched posture — a major contributor to upper back discomfort.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: null,
  },
  {
    id: "gentleNeckSideStretch",
    name: "Gentle Neck Side Stretch",
    region: ["upper"],
    indicatedFor: "upper back, base of neck, general tension",
    description:
      "Sit or stand tall. Place one hand behind your back. With the other hand, very gently guide your head to the side until you feel a light stretch — let your hand add only light pressure, never force or pull. Hold, then repeat gently toward the front at roughly a 45-degree angle.",
    purpose:
      "Releases tension through the side and base of the neck that often accompanies upper back tightness. Going slowly and gently is what makes this safe — this should always feel like a mild stretch, never a pull.",
    videoUrl: null,
    sets: 2,
    reps: 1,
    holdSeconds: 20,
  },
  {
    id: "claspedHandsForwardStretch",
    name: "Clasped Hands Forward Reach",
    region: ["upper"],
    indicatedFor: "upper back, general stiffness, desk-related tension",
    description:
      "Interlace your fingers and stretch your arms out in front of you, rounding your upper back slightly as you push your hands as far forward as comfortable.",
    purpose:
      "A simple, accessible stretch for upper back tension that can be done almost anywhere, including at a desk.",
    videoUrl: null,
    sets: 2,
    reps: 1,
    holdSeconds: 20,
  },

  // ---------------- General ----------------
  {
    id: "catCamel",
    name: "Cat-Camel",
    region: ["lower", "general"],
    indicatedFor: "general stiffness, mobility loss, all regions, gentle warmup, early-stage recovery",
    description:
      "On your hands and knees, slowly alternate between arching your back upward and letting it gently sag downward, moving only within a comfortable, pain-free range.",
    purpose:
      "A gentle, rhythmic way to restore comfortable movement through your entire spine — often the first thing that feels good when your back is tight or sore.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: null,
  },
  {
    id: "childsPose",
    name: "Child's Pose",
    region: ["lower", "general"],
    indicatedFor: "general stiffness, gentle reset, all regions, flexion-tolerant",
    description:
      "Kneel and sit your hips back toward your heels, reaching your arms forward and letting your chest relax down toward the floor.",
    purpose:
      "A calming, whole-back stretch that gently decompresses the spine — a good reset whenever your back feels tight or tense.",
    videoUrl: null,
    sets: 3,
    reps: 1,
    holdSeconds: 30,
  },
];

export const backLevel1Info: LevelInfo = {
  name: "Gentle Mobility, Stretching & Relief",
  goal: "Reduce acute discomfort, restore basic comfortable movement, and build confidence that movement is safe.",
};

const level2Exercises: Exercise[] = [
  // ---------------- Lower back ----------------
  {
    id: "superman",
    name: "Superman",
    region: ["lower"],
    indicatedFor: "extension tolerance, posterior chain activation, lower back, building strength foundation",
    description:
      "Lie face down with arms stretched out in front of you. Gently lift your arms, chest, and legs a few inches off the floor at the same time, squeezing through your lower back and glutes. Hold briefly, then lower with control.",
    purpose:
      "Activates the muscles that run the length of your back and glutes, working together — these are key stabilizers that often weaken after a period of back pain.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: 2,
  },
  {
    id: "cobraPose",
    name: "Cobra Pose",
    region: ["lower"],
    indicatedFor: "extension-biased pain, worse with standing, building extension tolerance, lower back",
    description:
      "Lie face down with hands under your shoulders. Press through your hands to lift your chest off the floor, going only as high as feels comfortable, keeping your hips on the ground. Hold, then lower back down.",
    purpose:
      "A deeper progression of the gentle press-up — builds tolerance and strength through a fuller range of back extension, useful for pain that improves with arching rather than bending forward.",
    videoUrl: null,
    sets: 2,
    reps: 8,
    holdSeconds: 5,
  },
  {
    id: "gluteBridge",
    name: "Glute Bridge",
    region: ["lower"],
    indicatedFor: "general strengthening, lower back, hip stability, low-risk activation",
    description:
      "Lie on your back with knees bent and feet flat on the floor. Lift your hips upward by squeezing your glutes, until your body forms a straight line from shoulders to knees. Hold briefly, then lower with control.",
    purpose:
      "Strengthens the glutes, which are major stabilizers for your spine and hips. Weak glutes are one of the most common findings in people with ongoing back pain.",
    videoUrl: null,
    sets: 3,
    reps: 12,
    holdSeconds: 2,
  },
  {
    id: "piriformisStretch",
    name: "Piriformis Stretch",
    region: ["lower"],
    indicatedFor: "tight hips, lower back, sciatica-adjacent tightness, general stiffness",
    description:
      "Lying on your back, cross one ankle over the opposite knee. Gently pull the uncrossed leg toward your chest until you feel a stretch deep in the hip and glute. Hold, then switch sides.",
    purpose:
      "Targets the piriformis, a small deep hip muscle that — when tight — can contribute to lower back and sciatica-like pain. Releasing it often brings real relief.",
    videoUrl: null,
    sets: 2,
    reps: 6,
    holdSeconds: 25,
  },
  {
    id: "pigeonPose",
    name: "Pigeon Pose",
    region: ["lower"],
    indicatedFor: "tight hips, lower back, deeper hip mobility work, sciatica-adjacent tightness",
    description:
      "From hands and knees, bring one knee forward and angle your shin across your body, lowering your hips toward the floor while keeping them level. Extend the other leg straight back behind you. Keep your weight evenly supported by your hands at first. Hold gently, then switch sides.",
    purpose:
      "A deeper version of the piriformis stretch that requires more hip mobility — go slowly and only as deep as feels comfortable, since getting into this position correctly matters more than with simpler stretches.",
    videoUrl: null,
    sets: 2,
    reps: 1,
    holdSeconds: 30,
  },
 
  // ---------------- Mid back ----------------
  {
    id: "seatedThoracicRotation",
    name: "Seated Thoracic Rotation",
    region: ["mid"],
    indicatedFor: "rotational stiffness, mid back, active mobility, desk-related stiffness",
    description:
      "Sit upright, cross your arms over your chest, and gently rotate your upper body to one side as far as comfortable, keeping your hips facing forward. Return to center, then rotate to the other side.",
    purpose:
      "Builds active control of rotational movement through the mid-back — a more engaged progression from supported rotation exercises, closer to how your spine moves in daily life.",
    videoUrl: null,
    sets: 2,
    reps: 8,
    holdSeconds: null,
  },
  {
    id: "proneTRaise",
    name: "Prone T-Raise",
    region: ["mid"],
    indicatedFor: "mid back activation, rhomboid and mid-trap strengthening, postural support",
    description:
      "Lie face down with arms out straight to your sides, forming a T shape, thumbs pointing up. Gently lift your arms a few inches off the floor, squeezing your shoulder blades together. Hold briefly, then lower.",
    purpose:
      "Directly activates the muscles between your shoulder blades that support good posture and take pressure off the rest of your back — often under-used after a period of pain or inactivity.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: 2,
  },
 
  // ---------------- Upper back ----------------
  {
    id: "chinTucks",
    name: "Chin Tucks",
    region: ["upper"],
    indicatedFor: "upper back, base of neck, forward-head posture, desk-related pain",
    description:
      "Sitting or standing tall, gently draw your chin straight back, as if making a double chin, without tilting your head up or down. Hold briefly, then release.",
    purpose:
      "Counteracts the forward-head posture that often goes along with upper back and neck tension, gently strengthening the muscles that support your neck's alignment.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: 3,
  },
  {
    id: "scapularSqueezes",
    name: "Scapular Squeezes",
    region: ["upper"],
    indicatedFor: "upper back, postural activation, desk-related tension, rounded shoulders",
    description:
      "Sitting or standing tall, squeeze your shoulder blades together and slightly down, as if trying to hold a pencil between them. Hold briefly, then release.",
    purpose:
      "A simple, direct way to activate the postural muscles of your upper back that tend to weaken with long hours of sitting or hunching forward.",
    videoUrl: null,
    sets: 3,
    reps: 12,
    holdSeconds: 3,
  },
  {
    id: "proneYRaise",
    name: "Prone Y-Raise",
    region: ["upper", "mid"],
    indicatedFor: "mid and upper back activation, lower trapezius strengthening, postural support",
    description:
      "Lie face down with arms stretched out overhead in a Y shape, thumbs pointing up. Gently lift your arms a few inches off the floor, focusing on squeezing through your upper back. Hold briefly, then lower with control.",
    purpose:
      "Targets the lower trapezius, a postural muscle that supports both your mid and upper back — often weak in people who sit for long periods, and a useful complement to the T-raise.",
    videoUrl: null,
    sets: 2,
    reps: 10,
    holdSeconds: 2,
  },
 
  // ---------------- General ----------------
  {
    id: "birdDog",
    name: "Bird-Dog",
    region: ["lower", "general"],
    indicatedFor: "core and lower back stability, general strengthening, building control under movement",
    description:
      "Start on your hands and knees. Slowly extend one arm forward and the opposite leg backward at the same time, keeping your back flat and hips level. Hold briefly, then return and switch sides.",
    purpose:
      "Trains your core and back to work together to keep your spine stable while a limb moves — a skill that directly carries over to everyday movements like walking and bending.",
    videoUrl: null,
    sets: 2,
    reps: 8,
    holdSeconds: 3,
  },
  {
    id: "deadBug",
    name: "Dead Bug",
    region: ["general"],
    indicatedFor: "core control, general strengthening, building stability under movement, all regions",
    description:
      "Lie on your back with arms reaching toward the ceiling and knees bent at 90 degrees above your hips. Slowly lower one arm and the opposite leg toward the floor while keeping your lower back pressed flat against the ground. Return and switch sides.",
    purpose:
      "Builds core control in a supported position — the same bracing skill needed to protect your back during daily activities, practiced here without any real load or risk.",
    videoUrl: null,
    sets: 2,
    reps: 8,
    holdSeconds: null,
  },
];

export const backLevel2Info: LevelInfo = {
  name: "Activation & Stability",
  goal: "Build active strength and control in the muscles that support your spine, with low-impact, controlled movements.",
};

const level3Exercises: Exercise[] = [
  // ---------------- Lower back ----------------
  {
    id: "standingGoodMorning",
    name: "Standing Good Morning",
    region: ["lower"],
    indicatedFor: "lower back strengthening, posterior chain, hip hinge pattern, functional movement",
    description:
      "Stand with feet hip-width apart, hands behind your head or crossed over your chest. Push your hips back and hinge forward at the waist, keeping your back flat and knees slightly soft. Lower until you feel a stretch in your hamstrings, then drive your hips forward to return upright. Think 'hips back' not 'chest down.'",
    purpose:
      "Trains the hip-hinge pattern — the exact movement most associated with back injury when done poorly. Learning to hinge correctly with a neutral spine is one of the most protective things you can do for long-term back health.",
    videoUrl: null,
    sets: 3,
    reps: 10,
    holdSeconds: null,
  },
  {
    id: "elephantWalks",
    name: "Elephant Walks",
    region: ["lower"],
    indicatedFor: "hamstring flexibility, posterior chain, dynamic movement, lower back",
    description:
      "Stand with feet hip-width apart. Keeping your legs as straight as possible, walk forward slowly — alternating reaching each hand toward the opposite foot as you step. Let the movement be slow and deliberate, feeling the stretch through the back of each leg with every step.",
    purpose:
      "Dynamically loads the hamstrings through a full range of motion while keeping the spine long — translates directly to everyday bending and reaching movements that tight hamstrings make painful.",
    videoUrl: null,
    sets: 3,
    reps: 10,
    holdSeconds: null,
  },
  {
    id: "reverseHyperextension",
    name: "Reverse Hyperextension",
    region: ["lower"],
    indicatedFor: "lower back strengthening, glute activation, posterior chain, spinal decompression",
    description:
      "Lie face down on a sturdy table or bench with your hips at the edge and legs hanging off. Gripping the sides for stability, slowly raise both legs until they are parallel to the floor by squeezing your glutes and lower back. Hold briefly, then lower with control.",
    purpose:
      "One of the few exercises that simultaneously strengthens the lower back and gently decompresses the spine — gravity tracts the lower back during the lowering phase. A direct posterior chain strengthener that's hard to replicate any other way.",
    videoUrl: null,
    sets: 3,
    reps: 10,
    holdSeconds: 2,
  },
  {
    id: "singleLegRDL",
    name: "Single-Leg Romanian Deadlift",
    region: ["lower"],
    indicatedFor: "lower back, hip hinge, balance, posterior chain, return to sport",
    description:
      "Stand on one leg with a slight knee bend. Hinge forward at the hip, extending the free leg behind you for balance, keeping your back flat and hips square to the floor. Lower your torso until you feel a stretch in the standing leg's hamstring, then drive through the hip to return upright. Use a wall for light balance support if needed at first.",
    purpose:
      "Combines the hip-hinge pattern with single-leg balance — demanding for the entire posterior chain and directly relevant to activities like running, climbing stairs, and sport where single-leg stability matters.",
    videoUrl: null,
    sets: 3,
    reps: 8,
    holdSeconds: null,
  },
 
  // ---------------- Mid back ----------------
  {
    id: "proneWRaise",
    name: "Prone W-Raise",
    region: ["mid"],
    indicatedFor: "mid back activation, lower and mid trap strengthening, postural support",
    description:
      "Lie face down with arms bent at 90 degrees, elbows out to the sides forming a W shape, thumbs pointing up. Gently lift your arms a few inches off the floor, squeezing your shoulder blades down and together. Hold briefly, then lower with control.",
    purpose:
      "Directly targets the lower and mid trapezius — the postural muscles responsible for keeping the shoulder blades set and the mid-back stable. A natural progression from the Y-raise, working a different part of the same muscle group.",
    videoUrl: null,
    sets: 3,
    reps: 10,
    holdSeconds: 2,
  },
  {
    id: "resistanceBandRow",
    name: "Resistance Band Row",
    region: ["mid", "upper"],
    indicatedFor: "mid and upper back strengthening, horizontal pull pattern, rhomboids, postural correction, requires resistance band",
    description:
      "Anchor a resistance band at roughly waist height (around a door handle or post). Hold one end in each hand and step back until there is tension in the band. Pull your elbows back toward your hips, squeezing your shoulder blades together at the end of the movement. For more upper back emphasis, flare your elbows out to 90 degrees as you pull. For more mid-back emphasis, keep elbows close to your sides.",
    purpose:
      "The only horizontal pulling movement in the program — directly counteracts the rounded-forward posture that causes mid and upper back pain. A resistance band is required; they are inexpensive and widely available.",
    videoUrl: null,
    sets: 3,
    reps: 12,
    holdSeconds: null,
  },
  {
    id: "scapularPushUp",
    name: "Scapular Push-Up",
    region: ["mid"],
    indicatedFor: "mid back stability, serratus anterior, scapular control, postural support",
    description:
      "Start in a standard push-up position (or on your knees). Keeping your arms completely straight, lower your chest toward the floor purely by letting your shoulder blades come together — then push back up by spreading your shoulder blades apart as wide as possible. No elbow bending at all throughout the movement.",
    purpose:
      "Trains the serratus anterior and mid-back stabilizers in a way no other exercise in this program does — the muscles responsible for keeping the shoulder blades flat against the ribcage and moving correctly, which underpins healthy posture and upper body movement.",
    videoUrl: null,
    sets: 3,
    reps: 10,
    holdSeconds: null,
  },
 
  // ---------------- Upper back ----------------
  {
    id: "bandPullApart",
    name: "Band Pull-Apart",
    region: ["upper"],
    indicatedFor: "upper back, rear deltoids, rhomboids, postural correction, rounded shoulders, requires resistance band",
    description:
      "Hold a resistance band in both hands with arms extended straight in front of you at shoulder height, hands shoulder-width apart. Keeping arms straight, pull the band apart by squeezing your shoulder blades together until your arms are fully outstretched to each side. Slowly return to the start.",
    purpose:
      "Directly strengthens the rear deltoids and rhomboids — the muscles responsible for pulling the shoulders back and counteracting the forward-rounding that builds up from prolonged sitting. Simple, effective, and hard to do wrong.",
    videoUrl: null,
    sets: 3,
    reps: 15,
    holdSeconds: null,
  },
 
  // ---------------- General ----------------
  {
    id: "plank",
    name: "Plank",
    region: ["general"],
    indicatedFor: "core stability, lower back, general strengthening, anti-extension endurance",
    description:
      "Support yourself on your forearms and toes, body forming a straight line from head to heels. Rotate your hips slightly inward to protect your lower back, and avoid letting your hips sag or pike upward. Breathe steadily and hold. Start with shorter holds and build duration gradually.",
    purpose:
      "Builds the endurance of your entire core — front, sides, and back working together to resist extension. The cue to rotate the hips inward is important: it keeps the lower back protected and turns this from a passive hold into an active stability exercise.",
    videoUrl: null,
    sets: 3,
    reps: 1,
    holdSeconds: 30,
  },
  {
    id: "sidePlank",
    name: "Side Plank",
    region: ["general"],
    indicatedFor: "lateral core stability, obliques, quadratus lumborum, general strengthening",
    description:
      "Lie on your side, supporting yourself on one forearm with your elbow directly under your shoulder. Stack your feet or stagger them for more stability. Lift your hips off the floor until your body forms a straight line from head to feet. Hold, then switch sides.",
    purpose:
      "Trains the lateral stabilizers of the spine — the obliques and quadratus lumborum — which aren't addressed by front planks or any earlier exercises. Lateral core stability is particularly important for return to sport and for everyday movements involving rotation or side-bending.",
    videoUrl: null,
    sets: 3,
    reps: 1,
    holdSeconds: 20,
  },
  {
    id: "singleLegGluteBridge",
    name: "Single-Leg Glute Bridge",
    region: ["general"],
    indicatedFor: "glute strength, pelvic stability, lower back, progression from glute bridge",
    description:
      "Lie on your back with knees bent, feet flat on the floor. Extend one leg straight out. Drive through the heel of the planted foot to lift your hips until your body forms a straight line from shoulder to knee, squeezing your glute at the top. Keep your hips level — don't let the unsupported side drop. Lower with control, then switch sides.",
    purpose:
      "A meaningful progression from the double-leg glute bridge — isolating one side at a time exposes and corrects strength imbalances between sides, which are a common underlying driver of back pain and re-injury.",
    videoUrl: null,
    sets: 3,
    reps: 10,
    holdSeconds: 2,
  },
  {
    id: "birdDogSquare",
    name: "Bird-Dog Square",
    region: ["general"],
    indicatedFor: "core stability, anti-rotation, general strengthening, coordination, progression from bird-dog",
    description:
      "Start in the bird-dog position — on hands and knees, extend one arm forward and the opposite leg back. Instead of holding still, trace a small square with both your hand and your foot simultaneously: move out, up, in, and down, keeping your hips level and back flat throughout. Return to center and switch sides.",
    purpose:
      "A significant progression from the standard bird-dog — sustained movement rather than a static hold forces continuous anti-rotation engagement through the entire range. Directly transfers to the dynamic stability needed in sport and complex movement.",
    videoUrl: null,
    sets: 3,
    reps: 6,
    holdSeconds: null,
  },
  {
    id: "bearCrawl",
    name: "Bear Crawl",
    region: ["general"],
    indicatedFor: "full-body stability, core control, coordination, return to sport, general strengthening",
    description:
      "Start on hands and knees with your knees hovering just an inch off the floor. Move forward by simultaneously advancing your right hand and left foot, then your left hand and right foot, keeping your back flat and hips low. Move slowly and deliberately — this is a stability exercise, not a race.",
    purpose:
      "A demanding full-body stability movement used in physiotherapy rehabilitation protocols to rebuild coordinated core and limb control. The low knee hover is what makes it work — it forces sustained deep core activation throughout every step.",
    videoUrl: null,
    sets: 3,
    reps: 1,
    holdSeconds: 30,
  },
];
 
export const backLevel3Info: LevelInfo = {
  name: "Strength & Functional Loading",
  goal: "Build real-world strength and stability for daily activities, sport, and return to full loading.",
};

export const backProgram: ExerciseProgram = {
  1: level1Exercises,
  2: level2Exercises,
  3: level3Exercises
};

export const backLevelInfo: { [level: number]: LevelInfo } = {
  1: backLevel1Info,
  2: backLevel2Info,
  3: backLevel3Info
};