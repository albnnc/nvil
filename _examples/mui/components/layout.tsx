/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Box, BoxProps, Container } from "@mui/material";

export function Layout({ children, ...rest }: BoxProps) {
  return (
    <Box {...rest}>
      <Container>{children}</Container>
    </Box>
  );
}
