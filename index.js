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



dataset = readDICOMFile('000001.dcm');
dataset.PatientName = 'Mr Pambrun';
writeDICOMFile('out.dcm', dataset);
