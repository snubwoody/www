import dayjs from "dayjs";
export const formatDate = (value: string) => {
    const date = dayjs(value).format("MMMM DD, YYYY");
    return date;
};
