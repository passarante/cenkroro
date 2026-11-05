import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
}


export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface FlashMessage {
    success?: string | null;
    error?: string | null;
    info?: string | null;
    warning?: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash?: FlashMessage;
    [key: string]: unknown;
}

export interface Vessel {
    id: string;
    name: string;
    flag?: string;
    imo?: string;
    builtYear?: number;
    laneMeters: number;
    deadweight?: number;
    speedKnots?: number;
    reeferPlugs?: number;
    decks_json?: string[] | null;
    stowage_layout_json?: Record<string, any> | null;
    stowage_layout?: Record<string, any>;
    status?: string;
    currentPort?: string;
    nextPort?: string;
    captain?: string;
    cargoLoaded_json?: Record<string, any> | null;
    created_at?: string;
    updated_at?: string;
}

export interface Port {
    id: string;
    name: string;
    code: string;
    country: string;
    city?: string;
    type: string;
    berth?: string;
    hasCustoms?: boolean;
}

export interface VoyageRoute {
    id: string;
    name: string;
    code?: string;
    departurePort: string;
    arrivalPort: string;
    durationHours: number;
    distanceNm?: number;
    description?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface Voyage {
    id: string;
    vesselId?: string;
    vesselName?: string;
    route?: string;
    departurePort?: string;
    arrivalPort?: string;
    departureTime?: string;
    estimatedArrival?: string;
    durationHours?: number;
    status: string;
    totalCapacityLM: number;
    bookedLM: number;
    bookedVehicles: number;
    berth?: string;
    agent?: string;
    weatherCondition?: string;
    capacityPercent?: number;
    vessel?: Vessel;
    bookings?: Booking[];
}

export interface Forwarder {
    id: string;
    code?: string;
    name: string;
    country?: string;
    city?: string;
    taxOffice?: string;
    taxNumber?: string;
    eoriNumber?: string;
    activeBookings: number;
    creditLimitEur: number;
    currentBalanceEur: number;
    rating: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    paymentTermDays: number;
    discountPercent: number;
    allocatedLM: number;
    hasFrigoAgreement: boolean;
    hasAdrAgreement: boolean;
    status: string;
}

export interface Category {
    id: string;
    name: string;
    desc?: string;
    icon?: string;
    defaultLengthM: number;
    defaultMaxWeightTon: number;
    isReeferCapable: boolean;
    isAdrCapable: boolean;
}

export interface Tariff {
    id: string;
    category: string;
    categoryDescription?: string;
    route?: string;
    currency: string;
    basePriceUsd: number;
    validFrom?: string;
    validTo?: string;
    status: string;
    reeferSurchargeUsd: number;
    adrSurchargeUsd: number;
    ispsSecurityFeeUsd: number;
    bafFuelSurchargeUsd: number;
    maxGrossWeightTon: number;
    maxLengthMeters: number;
    includesLashing: boolean;
    includesWeighing: boolean;
    notes?: string;
}

export interface Booking {
    id: string;
    voyageId?: string | null;
    shipper: string;
    contactName?: string | null;
    contactSurname?: string | null;
    contactMail?: string | null;
    contactPhone?: string | null;
    truckPlate: string;
    trailerPlate?: string | null;
    driverName?: string | null;
    driverId?: string | null;
    driverPhone?: string | null;
    category: string;
    vehicleKind?: string | null;
    trailerType?: string | null;
    lengthMeters: number;
    widthMeters?: number;
    heightMeters?: number;
    weightTon: number;
    cargoDescription?: string | null;
    cargoType?: string;
    isReefer?: boolean;
    hasElectricity?: boolean;
    reeferTemp?: number | null;
    reeferPlugNumber?: string | null;
    isAdr?: boolean;
    adrClass?: string | null;
    unNumber?: string | null;
    status: string;
    boardingStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentAmountEur: number;
    bookingChannel: string;
    qrCodeStatus?: string;
    riskInfo_json?: Record<string, any> | null;
    documents_json?: Record<string, any> | null;
    failedBoardingDetails_json?: Record<string, any> | null;
    riskApproval_json?: Record<string, any> | null;
    deck?: string | null;
    lane?: number | null;
    slot?: number | null;
    gateInTime?: string | null;
    kantarWeightTon?: number | null;
    customsStatus?: string;
    mrnNumber?: string | null;
    created_at?: string;
    updated_at?: string;
    voyage?: Voyage | null;
    forwarder?: Forwarder | null;
}

export interface GateLog {
    id: string;
    time?: string;
    plate?: string;
    type?: string;
    gateNumber?: string;
    declaredWeight?: number;
    kantarWeight?: number;
    variance?: string;
    status?: string;
    driver?: string;
    sealNumber?: string;
    created_at?: string;
}

export interface DeckConfiguration {
    deckKey: string;
    vessel_id?: string;
    voyage_id?: string;
    config_json: Record<string, any>;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
