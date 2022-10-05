import express from "express";
const router = express.Router();


/*
import { ValidationError } from 'yup';
import { sequelize } from '@nws/core/src/database';
import { Group } from '../models/groups.model';
import { User } from '../../../identity/src/models/users.model';
*/

//sequelize.addModels([User, Group]);


import fetch from 'node-fetch';

export class IdentityServiceAdapter {
  getUser = async (id: string, authorization: string) =>
    (
      await fetch(`${process.env.IDENTITY_SERVICE_URL}/users/${id}`, {
        headers: { authorization },
      })
    ).json();
}

const UuidRegex = '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}';



export interface Service {}

export interface CrudService<T, CreateDto> extends Service {
  findAll(): Promise<T[]>;
  findOneById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update?(id: string, data: CreateDto): Promise<T | null>;
  delete?(id: string): Promise<T>;
}

//schema 
import * as Yup from 'yup';

export const PostArtistRequestSchema = Yup.object().shape({
  name: Yup.string().min(3).required(),
});

const TrackSchema = Yup.object().shape({
  artist: Yup.string().min(3).required(),
  name: Yup.string().required(),
});

export const PostPlaylistRequestSchema = Yup.object().shape({
  name: Yup.string().min(3).required(),
  tracks: Yup.array().of(TrackSchema),
  private: Yup.bool(),
});

export const PutPlaylistRequestSchema = Yup.object().shape({
  name: Yup.string().min(3),
  tracks: Yup.array().of(TrackSchema),
  private: Yup.bool(),
});

export default router;
