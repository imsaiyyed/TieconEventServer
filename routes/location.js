const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { EventLocation, validateLocation } = require("../models/staticPages");

router.get("/", async (req, res) => {
  try {
    const eventLocationInfo = await EventLocation.find().populate("event");
    res.send(eventLocationInfo);
  } catch (error) {
    res.send(error.message);
  }
});

router.post("/", async (req, res) => {
  let location = req.body;
  const googleMapsClient = require("@google/maps").createClient({
    key: "AIzaSyBQBKlrF8k8WNMtWCO1OJz7E-l7xlm_MpQ",
    Promise: Promise
  });

  googleMapsClient
    .geocode({ address: req.body.address })
    .asPromise()
    .then(response => {
      let { lat, lang } = response.results[0].geometry.location;
      location.latitude = lat;
      location.longitude = lang;

      var eventLocationInfo = new EventLocation(
        _.pick(location, [
          "event",
          "latitude",
          "latitudeDelta",
          "longitude",
          "longitudeDelta",
          "address"
        ])
      );
      const result = eventLocationInfo.save();
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});

router.put("/:id", async (req, res) => {
  try {
    const { error } = validateLocation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const eventLocationInfo = await EventLocation.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, [
        "event",
        "latitude",
        "latitudeDelta",
        "longitude",
        "longitudeDelta",
        "address"
      ]),
      { new: true }
    );

    if (!eventLocationInfo)
      return res
        .status(404)
        .send("The EventLocation Information with the given ID was not found.");

    res.send(eventLocationInfo);
  } catch (error) {
    res.send(error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const eventLocationInfo = await EventLocation.findById(
      req.params.id
    ).populate("event");
    if (!eventLocationInfo)
      return res
        .status(404)
        .send("The EventLocation Information with the given ID was not found.");
    res.send(eventLocationInfo);
  } catch (error) {
    res.send(error.message);
  }
});
//get location for a event using event id
router.get("/eventId/:id", async (req, res) => {
  try {
    const eventLocationInfo = await EventLocation.find()
      .where("event")
      .equals(req.params.id)
      .populate("event");
    if (!eventLocationInfo)
      return res
        .status(404)
        .send(
          "The EventLocation Information with the given Event ID was not found."
        );
    res.send(eventLocationInfo);
  } catch (error) {
    res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eventLocationInfo = await EventLocation.findByIdAndRemove(
      req.params.id
    );
    if (!eventLocationInfo)
      return res
        .status(404)
        .send("The EventLocation Information with the given ID was not found.");
    res.send(eventLocationInfo);
  } catch (error) {
    res.send(error.message);
  }
});
module.exports = router;
