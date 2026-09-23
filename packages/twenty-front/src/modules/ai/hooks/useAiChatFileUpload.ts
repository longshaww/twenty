import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadAbortControllersState } from '@/ai/states/agentChatUploadAbortControllersState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import {
  AGENT_CHAT_MAX_ATTACHMENT_SIZE_IN_BYTES,
  AGENT_CHAT_MAX_ATTACHMENT_SIZE_LABEL,
} from '@/ai/constants/AgentChatMaxAttachmentSizeInBytes';
import { type AgentChatFileUIPart } from '@/ai/types/AgentChatFileUIPart';
import { FileFolder } from '~/generated-metadata/graphql';

export const useAiChatFileUpload = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const store = useStore();
  const setAgentChatSelectedFiles = useSetAtomState(
    agentChatSelectedFilesState,
  );
  const setAgentChatUploadedFiles = useSetAtomState(
    agentChatUploadedFilesState,
  );
  const setAgentChatUploadAbortControllers = useSetAtomState(
    agentChatUploadAbortControllersState,
  );

  const forgetAbortController = (fileName: string) => {
    setAgentChatUploadAbortControllers((previousControllers) =>
      Object.fromEntries(
        Object.entries(previousControllers).filter(
          ([controllerFileName]) => controllerFileName !== fileName,
        ),
      ),
    );
  };

  const sendFile = async (file: File): Promise<AgentChatFileUIPart | null> => {
    const abortController = new AbortController();
    setAgentChatUploadAbortControllers((previousControllers) => ({
      ...previousControllers,
      [file.name]: abortController,
    }));

    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.AgentChat,
        signal: abortController.signal,
      });

      return {
        filename: file.name,
        mediaType: file.type,
        url: uploadedFile.url,
        fileId: uploadedFile.id,
        type: 'file',
      };
    } catch {
      const fileName = file.name;

      // An abort is the person pressing stop or removing the attachment, so it
      // is not worth a toast telling them their own action failed.
      if (!abortController.signal.aborted) {
        enqueueToast({
          variant: 'error',
          children: t`Failed to upload file: ${fileName}`,
        });
      }

      return null;
    } finally {
      forgetAbortController(file.name);
      setAgentChatSelectedFiles((previousSelectedFiles) =>
        previousSelectedFiles.filter(
          (selectedFile) => selectedFile.name !== file.name,
        ),
      );
    }
  };

  const uploadFiles = async (files: File[]) => {
    const oversizedFiles = files.filter(
      (file) => file.size > AGENT_CHAT_MAX_ATTACHMENT_SIZE_IN_BYTES,
    );
    const filesToUpload = files.filter(
      (file) => file.size <= AGENT_CHAT_MAX_ATTACHMENT_SIZE_IN_BYTES,
    );

    if (isNonEmptyArray(oversizedFiles)) {
      const oversizedFileNames = oversizedFiles
        .map((file) => file.name)
        .join(', ');
      const maximumSize = AGENT_CHAT_MAX_ATTACHMENT_SIZE_LABEL;
      enqueueToast({
        variant: 'error',
        children: t`Too large to attach (the limit is ${maximumSize}): ${oversizedFileNames}`,
      });
      setAgentChatSelectedFiles((previousSelectedFiles) =>
        previousSelectedFiles.filter(
          (selectedFile) =>
            !oversizedFiles.some(
              (oversizedFile) => oversizedFile.name === selectedFile.name,
            ),
        ),
      );
    }

    const uploadResults = await Promise.allSettled(
      filesToUpload.map((file) => sendFile(file)),
    );

    const successfulUploads = uploadResults.reduce<AgentChatFileUIPart[]>(
      (acc, result) => {
        if (result.status === 'fulfilled' && isDefined(result.value)) {
          acc.push(result.value);
        }
        return acc;
      },
      [],
    );

    if (isNonEmptyArray(successfulUploads)) {
      setAgentChatUploadedFiles((previousUploadedFiles) => [
        ...previousUploadedFiles,
        ...successfulUploads,
      ]);
    }

    const failedCount = uploadResults.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (failedCount > 0) {
      enqueueToast({
        variant: 'error',
        children: t`${failedCount} file(s) failed to upload`,
      });
    }
  };

  const cancelUpload = (fileName: string) => {
    store.get(agentChatUploadAbortControllersState.atom)[fileName]?.abort();
  };

  const cancelAllUploads = () => {
    Object.values(store.get(agentChatUploadAbortControllersState.atom)).forEach(
      (abortController) => abortController.abort(),
    );
  };

  return { uploadFiles, cancelUpload, cancelAllUploads };
};
