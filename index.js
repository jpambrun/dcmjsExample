const DCMJS = require('dcmjs');
const fs = require('fs');

function readDICOMFile(filename) {
  const content = fs.readFileSync(filename);
  const dicomData = DCMJS.data.DicomMessage.readFile(content.buffer);
  const dataset = DCMJS.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);
  dataset._meta = DCMJS.data.DicomMetaDictionary.namifyDataset(dicomData.meta);
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



const dataset = {
  ImageType: [ 'ORIGINAL', 'PRIMARY', 'AXIAL' ],
  InstanceCreationDate: '20060629',
  InstanceCreationTime: '125429',
  SOPClassUID: '1.2.840.10008.5.1.4.1.1.2',
  SOPInstanceUID: '1.3.6.1.4.1.9328.50.17.156813157469317477610145582477245987122',
  StudyDate: '20060629',
  SeriesDate: '20060629',
  AcquisitionDate: '20060629',
  ContentDate: '20060629',
  StudyTime: '124722',
  SeriesTime: '125233',
  AcquisitionTime: '125420',
  ContentTime: '125429',
  AccessionNumber: '',
  Modality: 'CT',
  Manufacturer: 'GE MEDICAL SYSTEMS',
  InstitutionName: '',
  ReferringPhysicianName: '',
  StudyDescription: 'Unspecified CT',
  ManufacturerModelName: 'LightSpeed VCT',
  PatientName: '157631',
  PatientID: 'RIDER-1006487867',
  PatientBirthDate: '',
  PatientSex: '',
  PatientAge: '',
  PatientIdentityRemoved: 'YES',
  DeidentificationMethod: 'CTP: DICOM-S142-Baseline: 20090420:133941',
  '00130010': 'CTP',
  '00131010': 'RIDER Lung PET-CT\u0000',
  '00131013': '56713007',
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
  StudyInstanceUID: '1.3.6.1.4.1.9328.50.17.106165719864837115866539427306648068553',
  SeriesInstanceUID: '1.3.6.1.4.1.9328.50.17.249836005616032823097408901947312961772',
  StudyID: '',
  SeriesNumber: '3',
  AcquisitionNumber: '1',
  InstanceNumber: '1',
  ImagePositionPatient: [ '-174.000000', '-181.000000', '15.000000' ],
  ImageOrientationPatient: 
   [ '1.000000',
     '0.000000',
     '0.000000',
     '0.000000',
     '1.000000',
     '0.000000' ],
  FrameOfReferenceUID: '1.3.6.1.4.1.9328.50.17.332813002545792437845894102858881370357',
  PositionReferenceIndicator: 'SN',
  SliceLocation: '15.000000',
  SamplesPerPixel: 1,
  PhotometricInterpretation: 'MONOCHROME2',
  Rows: 512,
  Columns: 512,
  PixelSpacing: [ '0.703125', '0.703125' ],
  BitsAllocated: 16,
  BitsStored: 16,
  HighBit: 15,
  PixelRepresentation: 1,
  PixelPaddingValue: -2000,
  WindowCenter: '100',
  WindowWidth: '750',
  RescaleIntercept: '-1024',
  RescaleSlope: '1',
  RescaleType: 'HU',
  PerformedProcedureStepStartDate: '20060629',
  PerformedProcedureStepStartTime: '124722',
  RequestedProcedureID: '',
  PixelData: (new Int16Array(512*512)).buffer,
  _meta: {
    FileMetaInformationVersion:{ vr: 'OB', Value: [(new Uint8Array([0, 1])).buffer]}
  },
  _vrMap: { PixelData: 'OW' },
};

// data.


// const dataset1 = readDICOMFile('000001.dcm');
// console.log(dataset._meta.FileMetaInformationVersion.Value)
// console.log(dataset1._meta.FileMetaInformationVersion.Value)
// console.log(dataset)
dataset.PatientName = 'Mr Pambrun';
writeDICOMFile('out.dcm', dataset);


