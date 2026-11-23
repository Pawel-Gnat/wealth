import { PAGE_SIZES } from "../constants/pagination.constant";

export const isPageSize = (size: number) =>
	PAGE_SIZES.some((pageSize) => pageSize === size);
