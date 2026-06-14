import { mutationOptions } from "@tanstack/react-query";
import { apiFetchJson, apiPath } from "src/lib/api-client";
import type {
  AlbumSummary,
  CreateAlbumInput,
  CreateInviteInput,
  InviteOutput,
  JoinInviteInput,
  RenameAlbumInput,
  StickerOperation,
} from "src/lib/schemas";

export type StickerOperationVariables = {
  albumId: string;
  operation: StickerOperation;
};

export type CreateAlbumVariables = CreateAlbumInput;

export type CreateInviteVariables = {
  albumId: string;
  input: CreateInviteInput;
};

export type JoinInviteVariables = JoinInviteInput;

export type RenameAlbumVariables = {
  albumId: string;
  input: RenameAlbumInput;
};

export const stickerOperationMutationOptions = mutationOptions({
  mutationFn: async ({ albumId, operation }: StickerOperationVariables) => {
    return apiFetchJson<{ quantity: number }>(
      apiPath(`/albums/${albumId}/stickers`),
      {
        method: "PATCH",
        body: JSON.stringify(operation),
      },
    );
  },
});

export const createAlbumMutationOptions = mutationOptions({
  mutationFn: async (input: CreateAlbumVariables) => {
    return apiFetchJson<AlbumSummary>(apiPath("/albums"), {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
});

export const createInviteMutationOptions = mutationOptions({
  mutationFn: async ({ albumId, input }: CreateInviteVariables) => {
    return apiFetchJson<InviteOutput>(apiPath(`/albums/${albumId}/invites`), {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
});

export const joinInviteMutationOptions = mutationOptions({
  mutationFn: async ({ token, password }: JoinInviteVariables) => {
    return apiFetchJson<{ id: string }>(apiPath(`/invites/${token}/join`), {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  },
});

export const renameAlbumMutationOptions = mutationOptions({
  mutationFn: async ({ albumId, input }: RenameAlbumVariables) => {
    return apiFetchJson<AlbumSummary>(apiPath(`/albums/${albumId}`), {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
});
