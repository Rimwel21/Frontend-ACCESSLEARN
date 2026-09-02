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

export interface WordGestureClassSummary {
  label: string
  sample_count: number
}

export interface WordGestureSummary {
  dataset_dir: string
  classes: WordGestureClassSummary[]
  model_metadata: Record<string, unknown> | null
  trained_classes?: string[]
}

export interface TutorialStatus {
  word: string
  has_video: boolean
  video_path: string | null
  video_url: string | null
  has_landmark_sample: boolean
  landmark_sample_path: string | null
  has_practice_dataset: boolean
  is_trained_in_word_model: boolean
  reference_count: number
  can_practice: boolean
}

export interface SequenceScoreResponse {
  target_word: string
  nearest_reference_index: number
  target_distance: number
  target_distance_threshold: number
  score: number
}

export interface PracticeResultOut {
  id: number
  activity_id: number
  student_id: number
  progress_id: number | null
  word: string
  attempt_scores: number[]
  highest_score: number
  completed_at: string | null
  created_at: string
  updated_at: string
}
