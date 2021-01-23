import * as React from "react";

import styled, { css } from "styled-components";
import { CaretDown } from "./CaretDown";
import { TestMap } from "./TestMap";

import { TestRendererContent } from "./TestRendererContent";
import { tests } from "./tests";

const hashString = decodeURIComponent(window.location.hash).slice(1);
const hashParts = hashString.split("|");
const active = hashParts[0].split("/");
const onlyContent = hashParts[1] != null && hashParts[1] === "1";

export function App() {
  const [state, setState] = React.useState<{
    active: string[];
    onlyContent: boolean;
  }>({
    onlyContent: onlyContent,
    active: active,
  });

  React.useEffect(() => {
    let str = `#${state.active.join("/")}`;
    if (state.onlyContent) {
      str += `|1`;
    }

    window.location.hash = str;
  }, [state.active, state.onlyContent]);

  if (state.onlyContent) {
    return (
      <FullScreen>
        <TestRendererContent keys={state.active} />
      </FullScreen>
    );
  }

  return (
    <Content>
      <LeftNavigation>
        <SubNavigation
          map={tests}
          level={0}
          keys={[]}
          onClick={(keys) => {
            setState((prev) => ({ ...prev, active: keys }));
          }}
          activeKeys={state.active}
        />
      </LeftNavigation>

      <TestRendererContent keys={state.active} />
    </Content>
  );
}

function SubNavigation({
  map,
  level,
  keys,
  activeKeys,
  onClick,
}: {
  map: TestMap;
  level: number;
  keys: string[];
  activeKeys: string[];
  onClick: (keys: string[]) => void;
}): JSX.Element {
  const innerElements = (
    <>
      {Object.keys(map).map((key) => {
        const ownKeys = [...keys, key];

        const value = map[key];

        if (typeof value === "object") {
          return (
            <Group
              name={key}
              activeKeys={activeKeys}
              level={level}
              onClick={onClick}
              ownKeys={ownKeys}
              value={value}
            />
          );
        } else {
          return (
            <Title
              onClick={() => onClick(ownKeys)}
              style={{ marginLeft: level * 16 }}
              active={ownKeys.join(",") === activeKeys.join(",")}
            >
              {key}
            </Title>
          );
        }
      })}
    </>
  );

  return innerElements;
}

export function Group({
  name,
  level,
  value,
  onClick,
  ownKeys,
  activeKeys,
}: {
  level: number;
  name: string;
  value: TestMap;
  onClick: (keys: string[]) => void;
  activeKeys: string[];
  ownKeys: string[];
}) {
  const [open, setOpen] = React.useState(false);

  const content = (
    <Box style={{ marginLeft: level * 16 }}>
      <Title
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        active={open}
      >
        {name}

        <Icon open={open}>
          <CaretDown />
        </Icon>
      </Title>

      {open && (
        <div style={{ marginTop: 8 }}>
          <SubNavigation
            map={value}
            level={level + 1}
            onClick={onClick}
            keys={ownKeys}
            activeKeys={activeKeys}
          />
        </div>
      )}
    </Box>
  );

  if (level === 0) {
    return <Level0Box>{content}</Level0Box>;
  }

  return content;
}

const FullScreen = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const Icon = styled.div<{ open: boolean }>`
  width: 16px;
  height: 16px;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  transform: rotateZ(${(props) => (props.open ? "0" : "-90")}deg);

  > * {
    height: 20px;
    width: 20px;
  }
`;

const Level0Box = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  padding: 16px;
`;

const activeCss = css`
  color: white;
`;

const Box = styled.div``;

const Title = styled.div<{ active: boolean }>`
  position: relative;
  font-family: Arial;
  color: rgba(255, 255, 255, 0.66);
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  margin-top: 4px;

  ${(props) => (props.active ? activeCss : undefined)}
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: 1fr;
  height: 100vh;
  width: 100vw;
`;

const LeftNavigation = styled.div`
  background: #141414;
`;
