import { PromotionRequest } from "../types/promotion.types";

export class HashtagGenerator {
  /**
   * Generates targeted hashtag strategy by industry and business name
   */
  public static async generateHashtags(request: PromotionRequest): Promise<string[]> {
    const baseTags = [
      `#${request.businessName.replace(/\s+/g, "")}`,
      `#${request.industry.replace(/\s+/g, "")}`,
      "#MarketPilotAI",
      "#TrendingReels",
      "#ViralVideo",
    ];

    const industryMap: Record<string, string[]> = {
      business: ["#B2BMarketing", "#CorporateGrowth", "#EnterpriseSaaS", "#Leadership"],
      product: ["#ProductLaunch", "#ShopOnline", "#MustHave", "#DailyDeals"],
      website: ["#WebDesign", "#SaaS", "#TechInnovation", "#StartupGrowth"],
      app: ["#MobileApp", "#AppStore", "#TechTools", "#iOSApp"],
      "social-profile": ["#FollowForMore", "#CreatorGrowth", "#DailyTips", "#ViralShorts"],
      restaurant: ["#Foodie", "#RestaurantLife", "#Delicious", "#WeekendEats"],
      shop: ["#LocalBusiness", "#BoutiqueStyle", "#NewArrivals", "#SaleAlert"],
      "real-estate": ["#RealEstate", "#DreamHome", "#LuxuryListing", "#PropertyTour"],
      "hotel-hospitality": ["#TravelGoals", "#LuxuryHotel", "#VacationVibes", "#ResortLife"],
      "fitness-gym": ["#FitnessMotivation", "#GymLife", "#WorkoutRoutine", "#Transformation"],
      education: ["#OnlineCourse", "#LearnToCode", "#CareerGrowth", "#TechSkills"],
      "salon-beauty": ["#BeautyCare", "#SalonTransformation", "#GlamGoals", "#SelfCare"],
      healthcare: ["#WellnessJourney", "#MedicalCare", "#HealthyLiving", "#SpecialistCare"],
      recruitment: ["#HiringNow", "#CareerOpportunity", "#WorkplaceCulture", "#JoinOurTeam"],
      "freelancer-personal-brand": ["#FreelanceLife", "#PersonalBrand", "#UXDesign", "#Consultant"],
    };

    const specific = industryMap[request.industry] || industryMap["business"];
    return Array.from(new Set(baseTags.concat(specific)));
  }

}
