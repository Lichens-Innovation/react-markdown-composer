import JsonView from "@uiw/react-json-view";
import { darkTheme } from "@uiw/react-json-view/dark";
import { lightTheme } from "@uiw/react-json-view/light";
import { TriangleSolidArrow } from "@uiw/react-json-view/triangle-solid-arrow";
import type { CSSProperties, FunctionComponent, KeyboardEvent, MouseEvent } from "react";

import { useIsAntdDark } from "../hooks/use-is-antd-dark";
import { buildObjectPath, toJsonViewValue } from "../markdown-composer.utils";

interface ObjectGraphPanelProps {
  inputData: unknown;
  onKeyNameClick: (path: string) => void;
}

interface HandleKeyNameClickArgs {
  event: MouseEvent<HTMLSpanElement>;
  keys: Array<string | number>;
}

interface HandleKeyNameKeyDownArgs {
  event: KeyboardEvent<HTMLSpanElement>;
  keys: Array<string | number>;
}

const OBJECT_GRAPH_STYLE = {
  height: "100%",
  overflow: "auto",
  padding: 8,
} as const satisfies CSSProperties;

export const ObjectGraphPanel: FunctionComponent<ObjectGraphPanelProps> = ({ inputData, onKeyNameClick }) => {
  const isDark = useIsAntdDark();
  const themeStyle = isDark ? darkTheme : lightTheme;

  const handleKeyNameClick = ({ event, keys }: HandleKeyNameClickArgs) => {
    event.stopPropagation();
    onKeyNameClick(buildObjectPath(keys));
  };

  const handleKeyNameKeyDown = ({ event, keys }: HandleKeyNameKeyDownArgs) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onKeyNameClick(buildObjectPath(keys));
  };

  return (
    <div style={OBJECT_GRAPH_STYLE} role="region" aria-label="Object graph">
      <JsonView value={toJsonViewValue(inputData)} style={themeStyle} enableClipboard collapsed={1}>
        <JsonView.Arrow>
          <TriangleSolidArrow />
        </JsonView.Arrow>

        <JsonView.KeyName
          render={(props, { keys = [] }) => (
            <span
              {...props}
              role="button"
              tabIndex={0}
              style={{ ...props.style, cursor: "pointer" }}
              onClick={(event) => handleKeyNameClick({ event, keys })}
              onKeyDown={(event) => handleKeyNameKeyDown({ event, keys })}
            />
          )}
        />
      </JsonView>
    </div>
  );
};
