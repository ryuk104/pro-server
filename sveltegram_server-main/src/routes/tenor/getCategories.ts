import express from "express";

import {getTenorCategories} from '../../utils/tenor' 

export default async function getCategories(req, res, next) {
  res.json(await getTenorCategories().catch(() => {}))
}