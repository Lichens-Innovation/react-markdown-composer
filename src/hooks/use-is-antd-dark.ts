import { isLightColor } from "@lichens-innovation/ts-common";
import { theme } from "antd";

const { useToken } = theme;

export const useIsAntdDark = (): boolean => {
  const { token } = useToken();
  return !isLightColor(token.colorBgContainer);
};
