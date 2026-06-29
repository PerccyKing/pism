import React, {type ReactNode} from 'react';
import {HtmlClassNameProvider} from '@docusaurus/theme-common';
import {DocProvider} from '@docusaurus/plugin-content-docs/client';
import DocItemMetadata from '@theme/DocItem/Metadata';
import DocItemLayout from '@theme/DocItem/Layout';
import type {Props} from '@theme/DocItem';
import Waline from "@site/src/components/Waline";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import MUIWrapper from "@site/src/components/MUIWrapper";
import MiniAppQRCode from "@site/src/components/MiniAppQRCode";

function substringFromStart(originalString: string, startString: string) {
  const startIndex = originalString.indexOf(startString);
  if (startIndex === -1) {
    return null;
  }
  return originalString.slice(startIndex);
}

/**
 * 从 docId 中提取工具 ID
 * 例如: "tools/id_generator/uuid" -> "uuid"
 *       "tools/endecryption/md5" -> "md5"
 */
function extractToolId(docId: string): string | undefined {
  const parts = docId.split('/');
  return parts.length > 0 ? parts[parts.length - 1] : undefined;
}

export default function DocItem(props: Props): ReactNode {
  const docHtmlClassName = `docs-doc-id-${props.content.metadata.id}`;
  const MDXComponent = props.content;
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const toolId = extractToolId(props.content.metadata.id);

  return (
    <MUIWrapper>
      <DocProvider content={props.content}>
        <HtmlClassNameProvider className={docHtmlClassName}>
          <DocItemMetadata/>
          <DocItemLayout>
            <MDXComponent/>
            <MiniAppQRCode toolId={toolId} compact/>
            {/*添加的评论区*/}
            <Waline language={currentLocale} path={substringFromStart(props.location.pathname, '/docs')}/>
          </DocItemLayout>
        </HtmlClassNameProvider>
      </DocProvider>
    </MUIWrapper>
  );
}
