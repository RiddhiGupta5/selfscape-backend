const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const Interest = require("../models/interestModel");
const checkAuth = require("../middleware/check-auth");

router.post("/", checkAuth, (req, res, next) => {
  const interest = new Interest({
    _id: new mongoose.Types.ObjectId(),
    interestName: req.body.interestName,
    description: req.body.description,
    category: req.body.category,
    user: req.userData.userId,
  });
  interest
    .save()
    .then((result) => {
      return res.status(201).json({
        message: "Interest added successfully",
        interest: {
          _id: result._id,
          interestName: result.interestName,
          description: result.description,
          category: result.category,
          user: result.user,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Failed Adding Interest",
        error: err,
      });
    });
});

router.get("/", checkAuth, (req, res, next) => {
  Interest.find({ user: req.userData.userId })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Found interests",
        interest: result,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Failed to find interests",
        error: err,
      });
    });
});

router.get("/checkStatus", checkAuth, (req, res, next) => {
  Interest.find({ user: req.userData.userId })
    .exec()
    .then((result) => {
      var hasLeisure = result.some(
        (interest) => interest.category == "Leisure"
      );
      var hasProductive = result.some(
        (interest) => interest.category == "Productive"
      );
      var hasLearning = result.some(
        (interest) => interest.category == "Learning"
      );
      if (hasLeisure && hasProductive && hasLearning) {
        return res.status(200).json({
          message: "User has added all required interests",
        });
      } else {
        console.log(hasLeisure);
        console.log(hasProductive);
        console.log(hasLearning);
        return res.status(400).json({
          message: "Some required interests are missing",
          hasLeisure: hasLeisure,
          hasLearning: hasLearning,
          hasProductive: hasProductive,
        });
      }
    });
});

router.get("/filter", checkAuth, (req, res, next) => {
  const id = req.query.interestId;
  const category = req.query.category;
  if (id != undefined) {
    Interest.findById(id)
      .exec()
      .then((interest) => {
        res.status(200).json({
          message: "Fond Interest",
          interest: interest,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  } else {
    Interest.find({
      user: req.userData.userId,
      category: category,
    })
      .exec()
      .then((result) => {
        return res.status(200).json({
          message: "Found interests",
          interest: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Failed to find interests",
          error: err,
        });
      });
  }
});

router.delete("/:interestId", checkAuth, (req, res, next) => {
  Interest.remove({ _id: req.params.interestId, user: req.userData.userId })
    .exec()
    .then((result) => {
      res.status(200).json({ message: "Interest Deleted" });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Interest deletion failed",
        error: err,
      });
    });
});

router.patch("/:interestId", checkAuth, (req, res, next) => {
  const id = req.params.interestId;
  const updateFields = {};
  for (const field of req.body.newInterestFields) {
    if (field.key != "interestName") updateFields[field.key] = field.value;
  }
  console.log(updateFields);
  Interest.update(
    { _id: id, user: req.userData.userId },
    { $set: updateFields }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Interest updated",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Interest update failed",
        error: err,
      });
    });
});

module.exports = router;
