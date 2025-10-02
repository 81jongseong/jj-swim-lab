require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");

const swimmingStyleSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  description: String,
  difficulty: String,
  isActive: Boolean,
  isPublicDemo: Boolean,
  tags: [String],
  cues: [String],
  cautions: [String],
  poster: String,
  modelUrl: String
}, { timestamps: true });

const SwimmingStyle = mongoose.model("SwimmingStyle", swimmingStyleSchema);

const defaultStyles = [
  {
    name: "freestyle",
    displayName: "?먯쑀??,
    description: "媛??湲곕낯?곸씠怨?鍮좊Ⅸ ?섏쁺 ?곷쾿",
    difficulty: "beginner",
    isActive: true,
    isPublicDemo: true,
    tags: ["鍮좊쫫", "珥덈낫??異붿쿇"],
    cues: ["?붽퓞移섎? ?믨쾶", "?먯? 臾쇱쓣 ?뚯뼱?밴린??],
    cautions: ["?닿묠 遺??二쇱쓽"]
  },
  {
    name: "backstroke",
    displayName: "諛곗쁺",
    description: "?깆쓣 ?怨??섏쁺?섎뒗 ?곷쾿",
    difficulty: "intermediate",
    isActive: true,
    isPublicDemo: true,
    tags: ["?꾩쭊"],
    cues: ["怨좉컻??泥쒖옣???ν빐"],
    cautions: ["諛⑺뼢 媛먭컖 ?좎?"]
  },
  {
    name: "breaststroke",
    displayName: "?됱쁺",
    description: "?붽낵 ?ㅻ━瑜??숈떆???吏곸씠???곷쾿",
    difficulty: "intermediate",
    isActive: true,
    isPublicDemo: true,
    tags: ["?먮┝", "泥대젰 ?덉빟"],
    cues: ["?????명씉 ??諛쒖감湲?],
    cautions: ["臾대쫷 遺??二쇱쓽"]
  },
  {
    name: "butterfly",
    displayName: "?묒쁺",
    description: "媛???대졄怨?媛뺣젹???곷쾿",
    difficulty: "advanced",
    isActive: true,
    isPublicDemo: true,
    tags: ["?대젮?", "?섎퉬"],
    cues: ["?붿? ?숈떆??, "?뚭퀬????],
    cautions: ["珥덈낫??鍮꾩텛泥?]
  }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("??MongoDB ?곌껐");
  await SwimmingStyle.deleteMany({});
  const result = await SwimmingStyle.insertMany(defaultStyles);
  console.log(`??${result.length}媛??곷쾿 ?앹꽦 ?꾨즺`);
  await mongoose.disconnect();
}).catch(err => console.error(err));
