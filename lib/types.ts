export type Gift = {
  id: string;
  title: string;
  subtitle: string;
  specs: string[];
  price_uah: number | null;
  image_url: string;
  shop_url: string;
  shop_name: string;
  sort: number;
};

export type Reservation = {
  gift_id: string;
  user_id: string;
  name: string;
};
