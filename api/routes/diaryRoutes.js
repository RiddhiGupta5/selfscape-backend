const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Diary = require("../models/diaryModel");
const checkAuth = require("../middleware/check-auth");

router.post("/", checkAuth, (req, res, next) => {
  const diary = new Diary({
    _id: new mongoose.Types.ObjectId(),
    mood: req.body.mood,
    diaryBody: req.body.diaryBody,
    shortDescription: req.body.shortDescription,
    isFavorite: req.body.isFavorite,
    user: req.userData.userId,
  });
  diary
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "Diary entry added successfully",
        diary: {
          _id: result._id,
          mood: result.mood,
          diaryBody: result.diaryBody,
          shortDescription: result.shortDescription,
          isFavorite: result.isFavorite,
          user: req.userData.userId,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Failed Adding Diary Entry",
        error: err,
      });
    });
});

router.get("/", checkAuth, (req, res, next) => {
  Diary.find({ user: req.userData.userId })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Found diary enteries",
        diary: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Failed to find diary enteries",
        error: err,
      });
    });
});

router.patch("/:diaryId", checkAuth, (req, res, next) => {
  const id = req.params.diaryId;
  const updateFields = {};
  for (const field of req.body.newDiaryFields) {
    if (field.key != "created_at") updateFields[field.key] = field.value;
  }
  console.log(updateFields);
  Diary.update({ _id: id, user: req.userData.userId }, { $set: updateFields })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Diary Entry updated",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Diary entry update failed",
        error: err,
      });
    });
});

module.exports = router;
