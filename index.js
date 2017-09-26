const DCMJS = require('dcmjs');
const fs = require('fs');

function getCurrentTimeString() {
  const now = new Date();
  return (
    `${now
      .getHours()
      .toString()
      .padStart(2, '0')}` +
    `${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}` +
    `${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`
  );
}
function getCurrentDateString() {
  const now = new Date();
  return (
    `${now.getFullYear()}` +
    `${now
      .getMonth()
      .toString()
      .padStart(2, '0')}` +
    `${now
      .getDate()
      .toString()
      .padStart(2, '0')}`
  );
}

function swapEndianness(buf) {
  //create a copy
  const bytes = new Uint8Array(buf.slice(0));
  const len = bytes.length;
  let holder;

  for (let i = 0; i < len; i += 2) {
    holder = bytes[i];
    bytes[i] = bytes[i + 1];
    bytes[i + 1] = holder;
  }
  return bytes.buffer;
}

function readDICOMFile(filename) {
  const content = fs.readFileSync(filename);
  const dicomData = DCMJS.data.DicomMessage.readFile(content.buffer);
  const dataset = DCMJS.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);
  dataset._meta = DCMJS.data.DicomMetaDictionary.namifyDataset(dicomData.meta);
  return dataset;
}

function createCTImageFrame(pixelBuffer, pixelMetaData, data) {
  const dataset = {
    ImageType: ['ORIGINAL', 'PRIMARY', 'AXIAL'],
    InstanceCreationDate: getCurrentDateString(),
    InstanceCreationTime: getCurrentTimeString(),
    SOPClassUID: '1.2.840.10008.5.1.4.1.1.2',
    SOPInstanceUID: DCMJS.data.DicomMetaDictionary.uid(),
    StudyDate: getCurrentDateString(),
    SeriesDate: getCurrentDateString(),
    AcquisitionDate: getCurrentDateString(),
    ContentDate: getCurrentDateString(),
    StudyTime: getCurrentTimeString(),
    SeriesTime: getCurrentTimeString(),
    AcquisitionTime: getCurrentTimeString(),
    ContentTime: getCurrentTimeString(),
    AccessionNumber: 'AN' + Math.floor(Math.random() * 100000000),
    Modality: 'CT',
    Manufacturer: 'None',
    InstitutionName: 'DefaultInstitutionName',
    ReferringPhysicianName: '',
    StudyDescription: 'DefaultDefaultInstitutionName',
    ManufacturerModelName: 'DefaultManufacturerModelName',
    PatientName: 'DefaultPN',
    PatientID: 'DefaultPID',
    PatientBirthDate: '19000909',
    PatientSex: '117',
    PatientAge: 'M',
    BodyPartExamined: 'CHEST',
    ScanOptions: 'HELICAL MODE',
    SliceThickness: '0.625000',
    KVP: '120',
    DataCollectionDiameter: '500.000000',
    SoftwareVersions: '06MW03.4',
    ReconstructionDiameter: '360.000000',
    DistanceSourceToDetector: '949.075012',
    DistanceSourceToPatient: '541.000000',
    GantryDetectorTilt: '0.000000',
    TableHeight: '154.000000',
    RotationDirection: 'CW',
    ExposureTime: '500',
    XRayTubeCurrent: '577',
    Exposure: '3',
    FilterType: 'BODY FILTER',
    GeneratorPower: '90000',
    FocalSpots: '1.200000',
    ConvolutionKernel: 'STANDARD',
    PatientPosition: 'FFS',
    StudyInstanceUID: DCMJS.data.DicomMetaDictionary.uid(),
    SeriesInstanceUID: DCMJS.data.DicomMetaDictionary.uid(),
    StudyID: '',
    SeriesNumber: '3',
    AcquisitionNumber: '1',
    InstanceNumber: '1',
    ImagePositionPatient: ['0.0000', '0.000', '0.00000'],
    ImageOrientationPatient: [
      '1.000000',
      '0.000000',
      '0.000000',
      '0.000000',
      '1.000000',
      '0.000000',
    ],
    FrameOfReferenceUID: DCMJS.data.DicomMetaDictionary.uid(),
    PositionReferenceIndicator: 'SN',
    SliceLocation: '15.000000',
    SamplesPerPixel: 1,
    PhotometricInterpretation: 'MONOCHROME2',
    Rows: pixelMetaData.Rows,
    Columns: pixelMetaData.Columns,
    PixelSpacing: ['0.703125', '0.703125'],
    BitsAllocated: pixelMetaData.BitsAllocated,
    BitsStored: pixelMetaData.BitsStored,
    HighBit: pixelMetaData.HighBit,
    PixelRepresentation: pixelMetaData.PixelRepresentation,
    PixelPaddingValue: pixelMetaData.PixelPaddingValue,
    WindowCenter: '100',
    WindowWidth: '750',
    RescaleIntercept: pixelMetaData.RescaleIntercept.toString(10),
    RescaleSlope: pixelMetaData.RescaleSlope.toString(10),
    RescaleType: 'HU',
    PerformedProcedureStepStartDate: getCurrentDateString(),
    PerformedProcedureStepStartTime: getCurrentTimeString(),
    RequestedProcedureID: '',
    PixelData: pixelBuffer,
    _meta: {
      FileMetaInformationVersion: { vr: 'OB', Value: [new Uint8Array([0, 1]).buffer] },
    },
    _vrMap: { PixelData: 'OW' },
  };

  // override properties of dataset with those of data.
  Object.assign(dataset, data);

  return dataset;
}

function writeDICOMFile(filename, dataset) {
  const EXPLICIT_LITTLE_ENDIAN = '1.2.840.10008.1.2.1';
  const meta = {
    FileMetaInformationVersion: dataset._meta.FileMetaInformationVersion.Value[0],
    MediaStorageSOPClassUID: dataset.SOPClassUID,
    MediaStorageSOPInstanceUID: dataset.SOPInstanceUID,
    TransferSyntaxUID: EXPLICIT_LITTLE_ENDIAN,
    ImplementationClassUID: DCMJS.data.DicomMetaDictionary.uid(),
    ImplementationVersionName: 'dcmjs-0.0',
  };

  const denaturalized = DCMJS.data.DicomMetaDictionary.denaturalizeDataset(meta);
  const dicomDict = new DCMJS.data.DicomDict(denaturalized);
  dicomDict.dict = DCMJS.data.DicomMetaDictionary.denaturalizeDataset(dataset);
  const outBuffer = dicomDict.write();
  fs.writeFileSync(filename, Buffer.from(outBuffer));
}

// #########################
//     "main"
// #########################

const pixelMetaData = {
  Rows: 512,
  Columns: 512,
  BitsAllocated: 16,
  BitsStored: 16,
  HighBit: 15,
  PixelRepresentation: 1,
  PixelPaddingValue: -2000,
  RescaleIntercept: -1000,
  RescaleSlope: 1,
};

const data = {
  PatientName: 'MR PAMBRUN',
  PatientID: 'PID' + Math.floor(Math.random() * 100000000),
  AccessionNumber: 'AN' + Math.floor(Math.random() * 100000000),
  StudyDescription: 'Test Study',
  SeriesNumber: '3',
  InstanceNumber: '1',
  StudyInstanceUID: DCMJS.data.DicomMetaDictionary.uid(),
  SeriesInstanceUID: DCMJS.data.DicomMetaDictionary.uid(),
  FrameOfReferenceUID: DCMJS.data.DicomMetaDictionary.uid(),
};

for (let i = 0; i < 100; i++) {
  const pixelData = new Int16Array(515 * 512);
  pixelData.fill(100 + i * 10);
  data.InstanceNumber = (i + 1).toString();
  (data.ImagePositionPatient = ['0.0000', '0.0000', i.toString()]),
    (dataset = createCTImageFrame(pixelData.buffer, pixelMetaData, data));
  writeDICOMFile(`out${i.toString().padStart('0', 6)}.dcm`, dataset);
}
