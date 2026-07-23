export interface BoundingBox {
  x_min: number
  y_min: number
  x_max: number
  y_max: number
}

export interface TopPrediction {
  label: string
  confidence: number
}

export interface PredictionResponse {
  detected: boolean
  prediction: string | null
  confidence: number
  box: BoundingBox | null
  top_predictions: TopPrediction[]
  frame_width: number
  frame_height: number
  prediction_source: string
  calibration_status: string | null
}

export interface CameraDetectionResponse extends PredictionResponse {
  confirmed_text: string
  confirmed_prediction: string | null
  threshold_met: boolean
  confirmation_progress: number
  confirmation_status: string
  dynamic_accepted: boolean
}

export interface BackspaceCameraSessionResponse {
  confirmed_text: string
  removed_letter: string | null
}
