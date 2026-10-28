export interface ImageElement {
  type: "image";
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number | string;
  fit?: "fill" | "contain" | "cover";
  position?: string;
  clipPath?: string;
  filter?: string;
  opacity?: number;
  rotate?: number;
  hover?: boolean;
  z?: number;
}

export interface TextElement {
  type: "text";
  animate?: "ink";
  text: string;
  x: number;
  y: number;
  w: number;
  font: string;
  size: number;
  color: string;
  align?: "left" | "center" | "right";
  rotate?: number;
  z?: number;
}

export type SpreadElement = ImageElement | TextElement;

export interface HoverZone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HoverArt {
  src: string;
  zones: HoverZone[];
}

export interface PageDefinition {
  background?: string;
  elements: SpreadElement[];
  hoverArt?: HoverArt;
}

export interface SpreadTemplate {
  id: string;
  left: PageDefinition;
  right: PageDefinition;
}

export interface PromptItem {
  category: string;
  text: string;
}

export const BASE_SPREADS: SpreadTemplate[] = [
  // 1. Primary Portrait in Vintage Oval Lace Frame
  {
    id: "the-everyday-portrait",
    left: {
      elements: [
        { type: "image", src: "/assets/wood.png", x: 16.07, y: 12.11, w: 70.15, h: 75.78, radius: 14, z: 1 },
        { type: "image", src: "/assets/frame-trim.png", x: 19.13, y: 17.77, w: 64.03, h: 63.67, fit: "contain", z: 2 },
        { type: "image", src: "/assets/user/portrait-main.png", x: 32.14, y: 29.1, w: 37.76, h: 41.02, radius: 200, fit: "cover", z: 3 }
      ]
    },
    right: {
      elements: [
        { type: "image", src: "/assets/flowers-top-right.png", x: 56.12, y: 3.13, w: 33.42, h: 24.61, rotate: 60, fit: "contain", hover: true, z: 1 },
        { type: "text", animate: "ink", text: "What part of yourself are you learning to understand better?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 2 },
        { type: "image", src: "/assets/sprig-raw-2.png", x: 6.63, y: 68.95, w: 39.54, h: 25, fit: "contain", hover: true, z: 1 }
      ]
    }
  },
  // 2. Outdoor Portrait Leaning on Pillar
  {
    id: "the-park-portrait",
    left: {
      elements: [
        { type: "image", src: "/assets/wood.png", x: 15, y: 10, w: 72, h: 80, radius: 12, z: 1 },
        { type: "image", src: "/assets/user/portrait-park.jpg", x: 20, y: 15, w: 62, h: 70, radius: 8, fit: "cover", z: 2 }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-02-hover.png",
        zones: [
          { x: 55, y: 8, w: 337, h: 152 },
          { x: 18, y: 338, w: 145, h: 150 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-02-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What makes you feel quietly confident?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  },
  // 3. "LOVE YOUR SELF" Outdoor Golden Hour Sky
  {
    id: "the-love-yourself",
    left: {
      elements: [
        { type: "image", src: "/assets/wood.png", x: 15, y: 10, w: 72, h: 80, radius: 14, z: 1 },
        { type: "image", src: "/assets/user/love-yourself.png", x: 20, y: 15, w: 62, h: 70, radius: 8, fit: "cover", z: 2 }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-05-hover.png",
        zones: [
          { x: 256, y: 8, w: 132, h: 147 },
          { x: 15, y: 335, w: 178, h: 160 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-05-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What is something you are becoming more comfortable with?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  },
  // 4. Personal Portrait in Warm Wooden Frame
  {
    id: "the-craft-workflow",
    left: {
      elements: [
        { type: "image", src: "/assets/wood.png", x: 15, y: 10, w: 72, h: 80, radius: 14, z: 1 },
        { type: "image", src: "/assets/user/purple-shirt-selfie.png", x: 20, y: 15, w: 62, h: 70, radius: 8, fit: "cover", position: "center 22%", z: 2 }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-03-hover.png",
        zones: [
          { x: 256, y: 10, w: 132, h: 145 },
          { x: 20, y: 336, w: 160, h: 154 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-03-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What is something you said yes to that changed your life?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  },
  // 5. Contemplative Park Reflection from Behind
  {
    id: "the-park-reflection",
    left: {
      elements: [
        { type: "image", src: "/assets/wood.png", x: 15, y: 10, w: 72, h: 80, radius: 14, z: 1 },
        { type: "image", src: "/assets/user/park-reflection.jpg", x: 20, y: 15, w: 62, h: 70, radius: 8, fit: "cover", z: 2 }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-04-hover.png",
        zones: [
          { x: 165, y: 8, w: 156, h: 145 },
          { x: 18, y: 330, w: 178, h: 155 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-04-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What are you slowly outgrowing?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  },
  // 6. Outdoor Park Portrait in Wooden Frame
  {
    id: "the-new-beginning",
    left: {
      elements: [
        { type: "image", src: "/assets/wood.png", x: 14, y: 12, w: 74, h: 76, radius: 14, z: 1 },
        { type: "image", src: "/assets/user/park-lawn-selfie.jpg", x: 18, y: 17, w: 66, h: 66, radius: 8, fit: "cover", position: "center 20%", z: 2 }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-06-hover.png",
        zones: [
          { x: 238, y: 10, w: 150, h: 170 },
          { x: 8, y: 380, w: 145, h: 125 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-06-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What is a decision you are glad you made?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  },
  // 7. Illustrated Antique Heart Locket with Monochrome Cameo
  {
    id: "the-heart-frame",
    left: {
      elements: [
        { type: "image", src: "/assets/spread-07-left.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        {
          type: "image",
          src: "/assets/user/mirror-selfie-bw.jpg",
          x: 25.8,
          y: 26.2,
          w: 48.4,
          h: 46.6,
          fit: "cover",
          position: "center 12%",
          clipPath: "url(#locket-heart-clip)",
          filter: "sepia(0.12) contrast(1.05)",
          z: 6
        }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-07-hover.png",
        zones: [
          { x: 217, y: 10, w: 170, h: 168 },
          { x: 17, y: 322, w: 175, h: 171 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-07-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What is something you once wished for that has quietly become part of your everyday life?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  },
  // 8. Floral Baroque Heart with Outdoor Portrait
  {
    id: "the-floral-heart",
    left: {
      elements: [
        { type: "image", src: "/assets/spread-08-left.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        {
          type: "image",
          src: "/assets/user/park-lawn-smile.jpg",
          x: 25,
          y: 29.5,
          w: 50,
          h: 44,
          fit: "cover",
          position: "center 10%",
          clipPath: "url(#floral-heart-clip)",
          filter: "sepia(0.08) contrast(1.04)",
          z: 6
        }
      ]
    },
    right: {
      hoverArt: {
        src: "/assets/spread-08-hover.png",
        zones: [
          { x: 224, y: 12, w: 155, h: 160 },
          { x: 15, y: 325, w: 180, h: 166 }
        ]
      },
      elements: [
        { type: "image", src: "/assets/spread-08-right.png", x: 0, y: 0, w: 100, h: 100, z: 5 },
        { type: "text", animate: "ink", text: "What is something beautiful you saw today?", x: 10.97, y: 39.45, w: 81.12, font: "'Tangerine', cursive", size: 36, color: "#483A2D", align: "center", z: 6 }
      ]
    }
  }
];

export const PROMPT_CATEGORIES = [
  {
    category: "Becoming",
    prompts: [
      "What part of yourself are you learning to understand better?",
      "What is something about yourself you used to judge but now accept?",
      "When do you feel most like yourself?",
      "What have you learned about yourself recently?",
      "What version of yourself do you miss?",
      "What part of you has changed the most in the past few years?",
      "What do you wish people understood about you without you having to explain?",
      "What is something you are still figuring out about yourself?",
      "What makes you feel quietly confident?",
      "What are you becoming more comfortable with?"
    ]
  },
  {
    category: "Seasons",
    prompts: [
      "What has changed so much that you sometimes forget how things used to be?",
      "What season of your life are you currently in?",
      "What are you slowly outgrowing?",
      "What would you tell yourself from a year ago?",
      "What are you learning to let happen instead of trying to control?",
      "What has gotten easier with time?",
      "What are you currently in the middle of, without knowing how it will turn out?",
      "What chapter of your life do you think about more often than you expected?",
      "What are you ready to leave behind?",
      "What deserves more of your time these days?"
    ]
  },
  {
    category: "Connection",
    prompts: [
      "Who makes you feel most understood?",
      "What is a quality in someone that always makes you feel at home?",
      "Who has changed the way you see the world?",
      "What is something someone once told you that stayed with you?",
      "When was the last time someone surprised you in a good way?",
      "What kind of person do you want to be for the people you love?",
      "Who do you wish you could have one more ordinary day with?",
      "What is something you have learned from loving someone?",
      "What makes a friendship feel like home to you?",
      "Who brings out a version of you that you really like?"
    ]
  },
  {
    category: "Little Things",
    prompts: [
      "What is something you once wished for that has quietly become part of your everyday life?",
      "What ordinary moment from this week do you want to remember?",
      "What tiny thing has been making you happy lately?",
      "What is a moment you wish you could pause?",
      "What does a good day look like for you lately?",
      "What is something you noticed recently that you would normally overlook?",
      "What part of your routine secretly brings you joy?",
      "What is your favorite kind of quiet?",
      "What little ritual makes life feel more like yours?",
      "What moment recently made you forget to check your phone?",
      "What is something beautiful you saw today?"
    ]
  },
  {
    category: "Living",
    prompts: [
      "What would you choose if you knew nobody would judge you?",
      "What are you doing because you genuinely want to, rather than because you think you should?",
      "What is something you said yes to that changed your life?",
      "What is a decision you are glad you made?",
      "What are you learning not to force?",
      "What would you do differently if you trusted yourself a little more?",
      "What are you currently making room for?",
      "What is something you are choosing for yourself these days?",
      "Where in your life do you want to take a different path?",
      "What does “a life that feels like mine” mean to you?"
    ]
  },
  {
    category: "Remembrance",
    prompts: [
      "What is a memory you wish you could step into for five minutes?",
      "What place holds a version of you that no longer exists?",
      "What smell instantly takes you somewhere else?",
      "What is a completely ordinary memory you would never want to lose?",
      "What song feels like a specific moment in your life?",
      "What is something from childhood you still carry with you?",
      "Which version of yourself would you most like to visit?",
      "What memory feels different every time you think about it?",
      "What person do you associate with a very specific season of your life?",
      "What is a moment you didn't realize was special until much later?"
    ]
  },
  {
    category: "Reflections",
    prompts: [
      "What are you quietly becoming?",
      "What are you carrying that you no longer need?",
      "What feels different about you lately?",
      "What are you making peace with?",
      "What are you learning to notice?",
      "What feels like home these days?",
      "What are you waiting for, and do you still want it?",
      "What has your life been trying to teach you lately?",
      "What are you allowing yourself to want?",
      "What would you like to remember about this version of you?"
    ]
  }
];

export const ALL_PROMPTS: PromptItem[] = PROMPT_CATEGORIES.flatMap(({ category, prompts }) =>
  prompts.map(text => ({ category, text }))
);
