import { Avatar } from './Avatar';
import { Country } from './Country';

export interface User
{
    id: number;
    wca_id: string | null;
    name: string;
    gender: 'm' | 'f' | 'o';
    country: Country;
    delegate_status: null | 'delegate';
    class: string;
    teams: Team[];
    avatar: Avatar
    dob: string;
    email: string;
}

interface Team
{
    friendly_id: string;
    leader: boolean;
    senior_member: boolean;
}

/*
SAMPLE OF DATA GIVEN FROM WCA API:
{
    "id": 88273,
    "wca_id": "2018PRON02",
    "name": "Phakinthorn Pronmongkolsuk (ภคินธร พรมงคลสุข)",
    "gender": "m",
    "country_iso2": "TH",
    "created_at": "2018-01-03T08:03:36.000Z",
    "updated_at": "2026-01-01T14:43:22.000Z",
    "url": "https://staging.worldcubeassociation.org/persons/2018PRON02",
    "country": {
      "id": "Thailand",
      "name": "Thailand",
      "continent_id": "_Asia",
      "iso2": "TH"
    },
    "delegate_status": null,
    "class": "user",
    "teams": [],
    "avatar": {
      "id": 75615,
      "status": "approved",
      "thumbnail_crop_x": 443,
      "thumbnail_crop_y": 231,
      "thumbnail_crop_w": 2319,
      "thumbnail_crop_h": 2319,
      "url": "https://assets-staging.worldcubeassociation.org/assets/a3ab8982d/assets/missing_avatar_thumb-d77f478a307a91a9d4a083ad197012a391d5410f6dd26cb0b0e3118a5de71438.png",
      "thumb_url": "https://assets-staging.worldcubeassociation.org/assets/a3ab8982d/assets/missing_avatar_thumb-d77f478a307a91a9d4a083ad197012a391d5410f6dd26cb0b0e3118a5de71438.png",
      "is_default": false,
      "can_edit_thumbnail": true
    },
    "dob": "1954-12-04",
    "email": "88273@worldcubeassociation.org"
}
  */