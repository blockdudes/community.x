type Condition = {
    address: string;
    maxAmount: number;
}

type Channels = {
    type: "general" | "governance" | "announcement";
    posts: Object[]
}

export type privateSpaceType = {
    name: string;
    image: string;
    createdBy: Object,
    entryCondition: Condition,
    interactCondition: Condition,
    members: Object,
    channels: Channels[]
}

export type intialPrivateSpaceType = {
    privateSpace: privateSpaceType[] | null,
    loading: boolean,
    error: string | null
}