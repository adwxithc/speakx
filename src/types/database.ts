export interface IUser{
    id:string;
    firstName:string;
    lastName:string;
    userName:string;
    email:string;
    password:string;
    profile?:string;
    blocked?:boolean;
    createdAt:string;
    focusLanguage?:string;
    proficientLanguage?:string[]
    followers: string[],
    following: string[],
    isMonetized:boolean;
    requestedForMonetization:boolean
   
}

   
   

    

export default IUser; 

export interface IPost{
    id:string;
    title:string
    content:string;
    image:string;
    userId:string;
    upvotes?:string[];
    comments?:string[];
    createdAt?:string;
    updatedAt?:string;
}

export interface ILanguage{
    id:string;
    name:string;
    basePrice:number;
    rate:number;
    createdAt?:string;
    updatedAt?:string;
}

export interface IComment{
    id:string;
    text:string;
    user:{userName:string, profile:string,id:string};
    postId:string;
    parentId:null|string;
    replys:number;
    createdAt:string;
    updatedAt:string;
}

export interface IChatRoom{
    id:string;
    members:string[];
    otherUserId: string;
    user: { userName: string, profile: string };
    createdAt?:string,
    updatedAt?:string,
    lastMessage:{text:string, createdAt:string, senderId:string},
    unseenMessageCount:number
}

export interface IMessage{
    id:string;
    roomId:string;
    senderId:string;
    text:string;
    seen:boolean;
    createdAt:string;
    updatedAt:string
}

export interface ITag{
    id:string;
    name:string,
    count:number
} 

export interface IWallet {
    id?: string;
    userId: string;
    silverCoins: number;
    goldCoins: number;
    money: number;
    transactions: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ISession{
    id:string;
    sessionCode:string;
    helper:string;
    learner?:string;
    startingTime?:string;
    endingTime?:string;
    rating?:number
    languageId?:string;
    rate:number;
    createdAt?:string;
    updatedAt?:string;
    offers:string[]
}

export interface IReport{
    id:string;
    type:'sessions'|'posts';
    referenceId:string;
    description:string;
    reportedUser:string;
    reporter:string;
    createdAt:string;
    updatedAt:string;
}

export interface IReportWithUsers{
    reports:(IReport&{reporterInfo:{
        id: string;
        userName: string;
        firstName:string;
        lastName:string;
        profile:string;

    }})[],
    reportedUserInfo:{
        id: string;
        userName: string;
        firstName:string;
        lastName:string;
        profile:string
    },
}

export interface IUsersSesssionData{
    helpingSessions:number;
    learningSessions:number;
    rating:number;
    avgHelpingSessionsPerMonth:number;
    avgLearningSessionsPerMonth:number
}

export interface IUserDetails extends Omit<IUser,'password'>{
    proficientLanguageInfo:ILanguage[];
    focusLanguageInfo:ILanguage;
    wallet:IWallet;
    session:IUsersSesssionData;
    social:{followers:number;following:number;posts:number;averageLikes:number}
    reports:(IReport&{reporterDetails:{firstName:string,lastName:string,userName:string,profile:string}})[]
}


export interface ICoinPurchasePlan{
    id:string;
    price:number;
    count:number;
    title:string;
    image:string;
    deleted?:boolean;
    createdAt:string,
    updatedAt:string
}