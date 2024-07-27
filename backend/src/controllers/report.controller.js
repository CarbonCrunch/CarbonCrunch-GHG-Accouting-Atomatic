import { Report } from "../models/report.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createNewReport = asyncHandler(async (req, res) => {
  const { reportName, facilityName, timePeriod, companyName, username } =
    req.body;

  if (!req.user || !companyName || !username) {
    throw new ApiError(401, "Unauthorized Request to create new report");
  }

  // Verify that the username in the request matches the authenticated user
  if (req.user.username !== username) {
    throw new ApiError(403, "Username mismatch");
  }

  const lastReport = await Report.findOne().sort({ reportId: -1 }).exec();
  let reportId = "000001";

  if (lastReport && lastReport.reportId) {
    const lastReportId = parseInt(lastReport.reportId, 10);
    reportId = (lastReportId + 1).toString().padStart(6, "0");
  }

  const report = await Report.create({
    reportId,
    reportName,
    facilityName,
    timePeriod,
    companyName,
    username,
    fuel: {},
    food: {},
    bioenergy: {},
    refrigerants: {},
    ehctd: {},
    wttfuels: {},
    material: {},
    waste: {},
    btls: {},
    ec: {},
    water: {},
    fg: {},
    homeOffice: {},
    ov: {},
    fa: {},
  });

  console.log(report);
  if (!report) {
    throw new ApiError(500, "Could not create report");
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $push: { reports: report._id },
  });

  if (!user) {
    throw new ApiError(500, "User not found");
  }

  res.status(201).json({
    success: true,
    data: {
      reportId: report.reportId,
      reportName: report.reportName,
    },
  });
});
export const getReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { companyName, facilityName } = req.query;

  try {
    let query = { reportId: reportId };

    if (companyName) {
      query.companyName = companyName;
    }

    if (facilityName) {
      query.facilityName = facilityName;
    }

    const report = await Report.find(query)
      .select(
        "fuel username reportId companyName timePeriod reportName facilityName"
      )
      .lean();

    // console.log("getReport", report);

    if (!report || report.length === 0) {
      return res.status(404).json({
        message: "No reports found for the user.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Reports fetched successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw new ApiError(
      500,
      "Something went wrong while fetching user reports."
    );
  }
});

export const deleteReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  if (!reportId) {
    throw new ApiError(400, "Report ID is required.");
  }

  try {
    const report = await Report.findOne({ reportId });
    if (!report) {
      throw new ApiError(404, "No report found with the provided ID.");
    }
    if (report.username !== req.user.username) {
      console.log("report.username", report.username);
      console.log("req.user.username", req.user.username);
      throw new ApiError(401, "Invalid user request");
    }
    const ordered_by_username = report.username;
    const user = await User.findOne({ username: ordered_by_username });
    if (!user) {
      throw new ApiError(
        404,
        "No user found with the username associated with this report."
      );
    }
    const user_report_id = report._id;
    user.reports = user.reports.filter(
      (rep) => rep._id.toString() !== user_report_id.toString()
    );
    await user.save();
    await Report.deleteOne({ reportId });
    res.status(200).json({ message: "Report deleted successfully." });
  CSSMediaRule} catch (error) {
    throw new ApiError(
      500,
      "An error occurred while deleting the report.",
      error
    );
  }
});

export const getUserReports = asyncHandler(async (req, res) => {
  const user = req.user;
  // console.log("getUserReports", user);
  if (!user) {
    throw new ApiError(401, "Cannot access reports");
  }
  try {
    const userReports = await Report.find({
      $or: [
        // marked for review need to check if $and will work or something else
        { userName: user.username },
        { companyName: user.companyName },
        { facilityName: user.facilityName },
      ],
    }).select(
      "fuel food username bioenergy refrigerants ehctd wttfuels material waste btls ec water fg homeOffice ownedVehicles fa reportId companyName timePeriod reportName facilityName"
    );

    // console.log("getUserReports", userReports);
    if (!userReports || userReports.length === 0) {
      return res.status(404).json({
        message: "No reports found for the user.",
        data: "zero",
      });
    }
    res.status(200).json({
      message: "Reports fetched successfully.",
      data: userReports,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw new ApiError(
      500,
      "Something went wrong while fetching user reports."
    );
  }
});

export const changeCurrentTab = asyncHandler(async (req, res) => {
  const { current_tab } = req.body;
  const { reportId } = req.params;
  if (!current_tab) {
    throw new ApiError(401, "Invalid tab");
  }
  const report = await Report.findOne({ reportId });
  if (!report) {
    throw new ApiError(401, "Report not found for report id ", reportId);
  }
  report.current_tab = current_tab;
  await report.save();

  res.status(201).json({
    success: true,
    message: "Current tab saved",
  });
});

export const getCurrentTab = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  if (!reportId) {
    throw new ApiError(401, "Report id not given!");
  }
  const report = await Report.findOne({ reportId });
  if (!report) {
    throw new ApiError(401, "Report not found for report id ", reportId);
  }
  res.status(201).json({
    success: true,
    data: report.current_tab,
  });
});

export const updateFuelData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { fuel } = req.body;
  // console.log("updateFuelData", reportId);
  // console.log("UpdateFuelDataQ", reportId, companyName, facilityName);
  if (!reportId || !companyName || !facilityName || !fuel) {
    throw new ApiError(
      400,
      "Report ID, company name, facility name, and fuel data are required."
    );
  }

  const report = await Report.findOne({
    reportId,
    companyName,
    facilityName,
  });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update fuel data.");
  }

  // Update the fuel data
  report.fuel = fuel;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Fuel data updated successfully",
    data: report.fuel
  });
});
// if (datatype == "food") {
//   const conversionRates = {
//     "1 standard breakfast": 0.84,
//     "1 gourmet breakfast": 2.33,
//     "1 cold or hot snack": 2.02,
//     "1 average meal": 4.7,
//     "Non-alcoholic beverage": 0.2,
//     "Alcoholic beverage": 1.87,
//     "1 hot snack (burger + fries)": 2.77,
//     "1 sandwich": 1.27,
//     "Meal, vegan": 1.69,
//     "Meal, vegetarian": 2.85,
//     "Meal, with beef": 6.93,
//     "Meal, with chicken": 3.39,
//   };
//   amounts.forEach((value) => {
//     const nnew = value[1] * conversionRates[value[0]];
//     value.push(nnew);
//   });
//   report.food = amounts;
// }

// if (datatype == "fuel") {
//   const conversionRates = {
//     CNG: 0.44,
//     LNG: 1.16,
//     LPG: 1.56,
//     "Natural gas": 2.02,
//     "Natural gas (100% mineral blend)": 2.03,
//     "Other petroleum gas": 0.94,
//     "Aviation spirit": 2.33,
//     "Aviation turbine fuel": 2.55,
//     "Burning oil": 2.54,
//     "Diesel (average biofuel blend)": 2.51,
//     "Diesel (100% mineral diesel)": 2.71,
//     "Fuel oil": 3.18,
//     "Gas oil": 2.76,
//     Lubricants: 2.75,
//     Naphtha: 2.12,
//     "Petrol (average biofuel blend)": 2.19,
//     "Petrol (100% mineral petrol)": 2.34,
//     "Processed fuel oils - residual oil": 3.18,
//     "Processed fuel oils - distillate oil": 2.76,
//     "Waste oils": 2.75,
//     "Marine gas oil": 2.78,
//     "Marine fuel oil": 3.11,
//     "Coal (industrial)": 2403.84,
//     "Coal (electricity generation)": 2252.34,
//     "Coal (domestic)": 2883.26,
//     "Coking coal": 3165.24,
//     "Petroleum coke": 3386.86,
//     "Coal (electricity generation - home produced)": 2248.82,
//   };
//   amounts.forEach((value) => {
//     const nnew = value[1] * conversionRates[value[0]];
//     value.push(nnew);
//   });
//   report.fuel = amounts;
// }

// if (datatype == "ov") {
//   const conversionRates = {
//     6001: 0.05,
//     6002: 0.05,
//     6003: 0.06,
//     6004: 0.05,
//     6005: 0,
//     6006: 0.16,
//     6007: 0.24,
//     6008: 0.18,
//     6009: 0.14,
//     6010: 0.16,
//     6011: 0.21,
//     6012: 0.17,
//     6013: 0.1,
//     6014: 0.11,
//     6015: 0.15,
//     6016: 0.12,
//     6017: 0,
//     6018: 0.18,
//     6019: 0.27,
//     6020: 0.2,
//     6021: 0.15,
//     6022: 0.19,
//     6023: 0.28,
//     6024: 0.17,
//     6025: 0.06,
//     6026: 0.09,
//     6027: 0.1,
//     6028: 0.1,
//     6029: 0.15,
//     6030: 0.18,
//     6031: 0.23,
//     6032: 0.17,
//     6033: 0.02,
//     6034: 0.13,
//     6035: 0.11,
//     6036: 0.08,
//     6037: 0.1,
//     6038: 0.13,
//     6039: 0.11,
//     6040: 0.21,
//     6041: 0.15,
//     6042: 0.31,
//     6043: 0.2,
//     6044: 0.12,
//     6045: 0.08,
//     6046: 0.1,
//     6047: 0.03,
//     6048: 0.04,
//     6049: 0.0,
//     6050: 0.03,
//     6051: 0.03,
//   };
//   amounts.forEach((value) => {
//     const nnew = value[1] * conversionRates[value[0]];
//     value.push(nnew);
//   });
//   report.ov = amounts;
// }

// if (datatype == "ehctd") {
//   // storing electricityGEF heatingGEF coolingGEF
//   const conversionRates = {
//     "District Cooling": 0.5469,
//     "Heating* and Steam": 0.1707,
//     Electricity: 0.6077,
//   };
//   amounts.forEach((value) => {
//     const nnew = value[1] * conversionRates[value[0]];
//     value.push(nnew);
//   });
//   report.ehctd = amounts;
// }

// if (datatype == "homeOffice") {
//   // storing electricityGEF heatingGEF coolingGEF
//   const conversionRates = {
//     "District Cooling": 0.5469,
//     "Heating* and Steam": 0.1707,
//     Electricity: 0.6077,
//   };
//   amounts.forEach((value) => {
//     const nnew = value[1] * conversionRates[value[0]];
//     value.push(nnew);
//   });
//   report.homeOffice = amounts;
// }
// if (datatype == "homeOffice") {
//   report.homeOffice = amounts;
// }
// if (datatype == "water") {
//   report.water = amounts;
// }

export const updateBioenergyData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { bioenergy } = req.body;

  if (!reportId || !companyName || !facilityName || !bioenergy) {
    throw new ApiError(
      400,
      "Report ID, company name, facility name, and bioenergy data are required."
    );
  }

  const report = await Report.findOne({
    reportId,
    companyName,
    facilityName,
  });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update bioenergy data.");
  }

  // Update the bioenergy data
  report.bioenergy = bioenergy;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Bioenergy data updated successfully",
    data: report.bioenergy,
  });
});

export const updateRefrigerantsData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { refrigerants } = req.body;

  if (!reportId || !companyName || !facilityName || !refrigerants) {
    throw new ApiError(
      400,
      "Report ID, company name, facility name, and refrigerants data are required."
    );
  }

  const report = await Report.findOne({
    reportId,
    companyName,
    facilityName,
  });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update refrigerants data.");
  }

  // Update the refrigerants data
  report.refrigerants = refrigerants;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Refrigerants data updated successfully",
    data: report.refrigerants,
  });
});

export const updateEHCTDData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { ehctd } = req.body;
  console.log("updateEHCTDData", reportId, companyName, facilityName, ehctd);

  if (!reportId || !companyName || !facilityName || !ehctd) {
    throw new ApiError(
      400,
      "Report ID, company name, facility name, and EHCTD data are required."
    );
  }

  const report = await Report.findOne({
    reportId,
    companyName,
    facilityName,
  });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update EHCTD data.");
  }

  // const { electricity, heating, cooling } = ehctd;

  // if (!electricity || !heating || !cooling) {
  //   throw new ApiError(
  //     400,
  //     "Electricity, heating, and cooling data are required."
  //   );
  // }

  // const electricityGEF = (0.6077 * electricity).toFixed(2);
  // const electricityTD = (0.0188 * electricity).toFixed(2);
  // const heatingGEF = (0.1707 * heating).toFixed(2);
  // const heatingTD = (0.009 * heating).toFixed(2);
  // const coolingGEF = (0.5469 * cooling).toFixed(2);

  // Update the EHCTD data
  report.ehctd = ehctd;
  // electricityGEF,
  // electricityTD,
  // heatingGEF,
  // heatingTD,
  // coolingGEF,

  await report.save();

  res.status(200).json({
    success: true,
    message: "EHCTD data updated successfully",
    data: report.ehctd,
  });
});

export const updateWTTFuelData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { wttfuels } = req.body;

  if (!reportId || !companyName || !facilityName || !wttfuels) {
    throw new ApiError(400, "Report ID, amounts, and total are required.");
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update WTTFuel data.");
  }

  report.wttfuels = wttfuels;

  await report.save();

  res.status(200).json({
    success: true,
    message: "WTTFuel data updated successfully",
    data: report.wttfuels,
  });
});

export const updateMaterialUseData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { material } = req.body;

  if (!reportId || !companyName || !facilityName || !material) {
    throw new ApiError(
      400,
      "Report ID, company name, facility name, and material data are required."
    );
  }

  const report = await Report.findOne({
    reportId,
    companyName,
    facilityName,
  });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update Material Use data.");
  }

  // Update the material use data
  report.material = material;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Material Use data updated successfully",
    data: report.material,
  });
});

export const updateWasteDisposalData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { waste } = req.body;

  if (!reportId || !companyName || !facilityName || !waste) {
    throw new ApiError(400, "Report ID, amounts, and total are required.");
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(
      401,
      "Unauthorized access to update Waste Disposal data."
    );
  }

  report.waste = waste;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Waste Disposal data updated successfully",
    data: report.waste,
  });
});

export const updateBTLSData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { btls } = req.body;

  if (!reportId || !btls || !companyName || !facilityName) {
    throw new ApiError(
      400,
      "Report ID, distance, landTotal, seaTotal, and total are required."
    );
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update BTLS data.");
  }

  report.btls = btls;

  await report.save();

  res.status(200).json({
    success: true,
    message: "BTLS data updated successfully",
    data: report.btls,
  });
});

export const updateECData = asyncHandler(async (req, res) => {
  // marked for review
  const { reportId, companyName, facilityName } = req.query;
  const { ec } = req.body;

  if (!reportId || !companyName || !ec || !facilityName) {
    throw new ApiError(400, "Report ID, distance, and total are required.");
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update EC data.");
  }

  report.ec = ec;

  await report.save();

  res.status(200).json({
    success: true,
    message: "EC data updated successfully",
    data: report.ec,
  });
});

export const updateFoodData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { food } = req.body;

  if (!reportId || !companyName || !facilityName || !food) {
    throw new ApiError(
      400,
      "Report ID, company name, facility name, and food data are required."
    );
  }

  const report = await Report.findOne({
    reportId,
    companyName,
    facilityName,
  });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update food data.");
  }

  // Update the food data
  report.food = food;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Food data updated successfully",
    data: report.food,
  });
});

export const updateWaterData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { water } = req.body;

  if (!reportId || !water || !companyName || !facilityName) {
    throw new ApiError(
      400,
      "Report ID and all water data parameters are required."
    );
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update Water data.");
  }

  report.water = water;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Water data updated successfully",
    data: report.water,
  });
});

export const updateFGData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { fg } = req.body;

  if (!reportId || !fg || !companyName || !facilityName) {
    throw new ApiError(400, "Report ID, amounts, and total are required.");
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update FG data.");
  }

  report.fg = fg;

  await report.save();

  res.status(200).json({
    success: true,
    message: "FG data updated successfully",
    data: report.fg,
  });
});

export const updateHomeOfficeData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { homeOffice } = req.body;

  if (!reportId || !homeOffice || !companyName || !facilityName) {
    throw new ApiError(
      400,
      "Report ID and all home office data parameters are required."
    );
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update home office data.");
  }

  report.homeOffice = homeOffice;

  await report.save();

  res.status(200).json({
    success: true,
    message: "Home office data updated successfully",
    data: report.homeOffice,
  });
});

export const updateOwnedVehiclesData = asyncHandler(async (req, res) => {
  const { reportId, companyName, facilityName } = req.query;
  const { ownedVehicles } = req.body;
  if (!reportId || !ownedVehicles || !companyName || !facilityName) {
    throw new ApiError(400, "Report ID, distances, and total are required.");
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(
      401,
      "Unauthorized access to update owned vehicles data."
    );
  }

  report.ownedVehicles = ownedVehicles;
  
  await report.save();
  console.log("ownedVehicles", report.ownedVehicles);

  res.status(200).json({
    success: true,
    message: "Owned vehicles data updated successfully",
    data: report.ownedVehicles,
  });
});

export const updateFAData = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { companyName, facilityName } = req.query;
  console.log("updateFAData", reportId, companyName, facilityName);
  const { hotelAccommodation, flightAccommodation } = req.body;

  if (!reportId || !companyName || !facilityName) {
    throw new ApiError(404, "Report not found.");
  }

  const report = await Report.findOne({ reportId, companyName, facilityName });
  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  if (report.username !== req.user.username) {
    throw new ApiError(401, "Unauthorized access to update FA data.");
  }

  report.fa = { hotelAccommodation, flightAccommodation };

  await report.save();

  res.status(200).json({
    success: true,
    message: "FA data updated successfully",
    data: report.fa,
  });
});

//  FHCTD
