import { Request, Response } from 'express';
import { getReadingValueFromImage } from '../services/geminiService';
import Reading from '../models/reading';
import { isValidBase64, isValidDate } from '../helpers/utils';
import { v4 as v4Uuid } from 'uuid';

export const uploadReading = async (request: Request, response: Response) => {
  const { image, customer_code, measure_datetime, measure_type } = request.body;

  if (!image || !customer_code || !measure_datetime || !measure_type)
    return response
      .status(400)
      .json({ error_code: 'INVALID_DATA', error_description: 'Forneça todos os dados' });

  if (!isValidBase64(image))
    return response
      .status(400)
      .json({ error_code: 'INVALID_DATA', error_description: 'Imagem inválida' });

  if (typeof customer_code !== 'string')
    return response
      .status(400)
      .json({ error_code: 'INVALID_DATA', error_description: 'Código do consumidor inválido' });

  if (!isValidDate(measure_datetime))
    return response
      .status(400)
      .json({ error_code: 'INVALID_DATA', error_description: 'Data da medição inválida' });

  if (!['WATER', 'GAS'].includes(measure_type))
    return response
      .status(400)
      .json({ error_code: 'INVALID_DATA', error_description: 'Tipo de medição inválido' });

  const hasPreviousReading = await Reading.getReadingByTypeAndDate(
    customer_code,
    measure_type,
    new Date(measure_datetime)
  );

  if (hasPreviousReading)
    return response
      .status(409)
      .json({ error_code: 'DOUBLE_REPORT', error_description: 'Leitura do mês já realizada' });

  try {
    const { imageUrl, measureValue } = await getReadingValueFromImage(image);
    const measureUuid = v4Uuid();
    const parsedMeasureValue = parseFloat(measureValue);

    await Reading.insertReading(
      measureUuid,
      customer_code,
      measure_type,
      imageUrl,
      parsedMeasureValue
    );

    response
      .status(200)
      .json({ image_url: imageUrl, measure_value: measureValue, measure_uuid: measureUuid });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error_code: 'SERVER_ERROR', error_description: 'Erro interno do servidor' });
  }
};

export const confirmReading = async (request: Request, response: Response) => {
  const { measure_uuid, confirmed_value } = request.body;
  const parsedValue = parseFloat(confirmed_value);

  if (typeof measure_uuid !== 'string' || isNaN(parsedValue))
    return response
      .status(400)
      .json({ error_code: 'INVALID_DATA', error_description: 'Tipos de dados inválidos.' });

  try {
    const reading = await Reading.findById(measure_uuid);

    if (!reading)
      return response
        .status(404)
        .json({ error_code: 'MEASURE_NOT_FOUND', error_description: 'Leitura não encontrada.' });

    if (reading.isConfirmed)
      return response.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada.',
      });

    await Reading.updateReadingValue(measure_uuid, confirmed_value);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error_code: 'SERVER_ERROR', error_description: 'Erro interno do servidor' });
  }
};

export const listReadings = async (request: Request, response: Response) => {
  const { customer_code } = request.params;
  const { measure_type } = request.query;
  const formattedType = typeof measure_type === 'string' ? measure_type.toUpperCase() : '';

  if (formattedType && ['WATER', 'GAS'].includes(formattedType))
    return response
      .status(400)
      .json({ error_code: 'INVALID_TYPE', error_description: 'Tipo de medição não permitida' });

  try {
    const queryOptions = measure_type
      ? { where: { customer_code, measure_type: formattedType } }
      : { where: { customer_code } };
    const measures = await Reading.findAll(queryOptions);

    if (measures.length === 0)
      return response.status(404).json({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      });

    const formattedResponse = {
      customer_code,
      measures: measures.map((measure) => ({
        measure_uuid: measure.id,
        measure_datetime: measure.measureDatetime,
        measure_type: measure.measureType,
        has_confirmed: measure.isConfirmed,
        image_url: measure.imageUrl,
      })),
    };

    return response.status(200).json(formattedResponse);
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error_code: 'SERVER_ERROR', error_description: 'Erro interno do servidor' });
  }
};
