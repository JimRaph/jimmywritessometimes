import React, {type ReactNode} from 'react';
import MDXContent from '@theme-original/MDXContent';
import type MDXContentType from '@theme/MDXContent';
import type {WrapperProps} from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import Summary from '@site/src/components/Summary';

type Props = WrapperProps<typeof MDXContentType>;

export default function MDXContentWrapper(props: Props): ReactNode {
  const { pathname } = useLocation();
  const isArticle = pathname.startsWith('/articles') || pathname.startsWith('/docs');

  return (
    <>
      {isArticle && <Summary />}
      <MDXContent {...props} />
    </>
  );
}
