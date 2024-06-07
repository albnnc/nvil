/** @jsx jsx */
import { jsx } from "@emotion/react";
import { cloneElement, forwardRef, isValidElement, MouseEvent } from "react";
import { LinkProps, useHref, useLinkClickHandler } from "react-router-dom";

export type LinkWrapperProps = LinkProps;

export const LinkWrapper = forwardRef<HTMLAnchorElement, LinkWrapperProps>(
  ({ onClick, replace = false, state, target, to, children, ...rest }, ref) => {
    const href = useHref(to);
    const handleClick = useLinkClickHandler(to, {
      replace,
      state,
      target,
    });
    const props = {
      href,
      target,
      onClick: function (event: MouseEvent<HTMLAnchorElement>) {
        onClick?.(event);
        if (!event.defaultPrevented) {
          handleClick(event);
        }
      },
      ref,
      ...rest,
    };
    if (isValidElement(children)) {
      return cloneElement(children, props);
    }
    throw new Error("Invalid children");
  },
);
