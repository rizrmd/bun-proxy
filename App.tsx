import React, {
  Fragment,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { Box, Newline, Text, type BoxProps } from "ink";
import { g } from "./global";

export default function App({ name = "Stranger" }) {
  const now = Date.now();
  return (
    <FullScreen>
      <Text>
        Proxy server running at:{" "}
        <Text color="greenBright" underline>
          http://localhost:{g.server?.port}
        </Text>
        <Newline />
        Active Request: {g.reqs.size}
        <Newline />
        {[...g.reqs.values()].map((e, idx) => {
          return (
            <Fragment key={idx}>
              <Text>
                [{(((now - e.started) / 1000).toFixed(2) + "s").padStart(8)}]{" "}
                <Text color={"cyan"}>{e.method.padEnd(5)}</Text>
                <Text color={"green"}>{e.ip.padEnd(15)}</Text>
                <Text color={"blue"}>{e.pathname}</Text>
              </Text>
              <Newline />
            </Fragment>
          );
        })}
      </Text>
    </FullScreen>
  );
}

function useStdoutDimensions(): [number, number] {
  const { columns, rows } = process.stdout;
  const [size, setSize] = useState({ columns, rows });
  useEffect(() => {
    function onResize() {
      const { columns, rows } = process.stdout;
      setSize({ columns, rows });
    }
    process.stdout.on("resize", onResize);
    return () => {
      process.stdout.off("resize", onResize);
    };
  }, []);
  return [size.columns, size.rows];
}

const FullScreen: React.FC<PropsWithChildren<BoxProps>> = ({
  children,
  ...styles
}) => {
  const [columns, rows] = useStdoutDimensions();
  return (
    <Box width={columns} height={rows} {...styles}>
      {children}
    </Box>
  );
};
