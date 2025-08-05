# ポケテニマスター UI/UX設計書

## 1. UI/UX設計理念

### 1.1 基本方針
- **直感的操作**: 誰でもすぐに理解できるインターface
- **効率性**: 最少クリックで目的達成
- **視覚的魅力**: ポケモンらしい親しみやすいデザイン
- **レスポンシブ**: PC・スマートフォン両対応
- **アクセシビリティ**: 誰でも使いやすい設計

### 1.2 デザインシステム
```typescript
interface DesignSystem {
  colorPalette: {
    primary: {
      main: '#3B82F6',      // ポケモンブルー
      light: '#60A5FA',
      dark: '#1D4ED8'
    };
    secondary: {
      main: '#F59E0B',      // エネルギッシュなオレンジ
      light: '#FBBF24',
      dark: '#D97706'
    };
    success: '#10B981';     // 成功・成長
    warning: '#F59E0B';     // 注意・警告
    error: '#EF4444';       // エラー・失敗
    info: '#06B6D4';        // 情報
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      500: '#6B7280',
      900: '#111827'
    };
  };
  
  typography: {
    fontFamily: {
      display: '"M PLUS Rounded 1c", sans-serif',  // 見出し用
      body: '"Noto Sans JP", sans-serif'           // 本文用
    };
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    };
  };
  
  spacing: {
    unit: 4;              // 基本単位4px
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];
  };
  
  borderRadius: {
    sm: '0.25rem',        // 4px
    md: '0.375rem',       // 6px  
    lg: '0.5rem',         // 8px
    xl: '0.75rem',        // 12px
    full: '9999px'
  };
}
```

## 2. 画面設計・ワイヤーフレーム

### 2.1 メイン画面レイアウト
```
┌─────────────────────────────────────────────────────────┐
│ Header: Logo | 学校名 | 現在日時 | Settings | Help        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │   Sidebar   │ │   Main Content  │ │   Right Panel   │ │
│ │             │ │                 │ │                 │ │
│ │- Dashboard  │ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │
│ │- Team       │ │ │ Time Control│ │ │ │ Quick Stats │ │ │
│ │- Training   │ │ └─────────────┘ │ │ └─────────────┘ │ │
│ │- Matches    │ │                 │ │                 │ │
│ │- Facilities │ │ ┌─────────────┐ │ │ ┌─────────────┐ │ │
│ │- Story      │ │ │   Current   │ │ │ │  Upcoming   │ │ │
│ │- Rankings   │ │ │   Activity  │ │ │ │   Events    │ │ │
│ │             │ │ └─────────────┘ │ │ └─────────────┘ │ │
│ └─────────────┘ └─────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Footer: ゲーム進行状況 | 通知 | バージョン情報           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 レスポンシブ対応
```typescript
interface ResponsiveBreakpoints {
  mobile: {
    maxWidth: '768px';
    layout: 'single_column';
    navigation: 'bottom_tab_bar';
    sidebar: 'collapsible_drawer';
  };
  
  tablet: {
    minWidth: '769px';
    maxWidth: '1024px'; 
    layout: 'two_column';
    navigation: 'side_navigation';
    sidebar: 'always_visible';
  };
  
  desktop: {
    minWidth: '1025px';
    layout: 'three_column';
    navigation: 'full_sidebar';
    panels: 'all_visible';
  };
}
```

## 3. 画面別詳細設計

### 3.1 メインダッシュボード
```typescript
interface DashboardLayout {
  header: {
    schoolInfo: {
      name: string;
      reputation: number;
      funds: number;
      currentDate: string;
    };
    
    quickActions: [
      { label: '練習実行', icon: 'training', shortcut: 'T' },
      { label: '試合参加', icon: 'match', shortcut: 'M' },
      { label: '選手管理', icon: 'team', shortcut: 'P' },
      { label: '時間進行', icon: 'clock', shortcut: 'Space' }
    ];
  };
  
  mainContent: {
    timeControl: {
      currentDate: 'prominent_display';
      speedControl: ['pause', 'normal', 'fast'];
      actionPointsRemaining: 'visual_indicator';
    };
    
    currentActivity: {
      inProgress: 'training_or_match_status';
      nextScheduled: 'upcoming_events_preview';
      recommendations: 'ai_suggested_actions';
    };
    
    weatherWidget: {
      currentWeather: 'affects_training_efficiency';
      forecast: '3_day_preview';
      seasonalInfo: 'spring_summer_autumn_winter';
    };
  };
  
  sidebar: {
    teamSummary: {
      playerCount: 'by_grade_and_position';
      averageLevel: number;
      teamPower: 'calculated_total_strength';
      morale: 'team_motivation_indicator';
    };
    
    facilities: {
      courtCondition: 'maintenance_level';
      equipmentStatus: 'durability_indicators';
      upcomingMaintenance: 'scheduled_repairs';
    };
    
    achievements: {
      recentUnlocks: 'latest_3_achievements';
      progress: 'current_goals_tracking';
      nextMilestone: 'upcoming_targets';
    };
  };
}
```

### 3.2 チーム管理画面
```typescript
interface TeamManagementUI {
  layout: {
    playerGrid: {
      viewModes: ['card', 'list', 'stats_comparison'];
      sortOptions: ['level', 'position', 'type', 'condition', 'custom'];
      filterOptions: {
        grade: [1, 2, 3, 'all'];
        position: ['captain', 'regular', 'member', 'all'];
        pokemonType: ['fire', 'water', 'electric', /*...*/, 'all'];
        condition: ['excellent', 'good', 'normal', 'poor', 'all'];
      };
    };
    
    playerCard: {
      primaryInfo: {
        pokemonSprite: 'animated_if_possible';
        name: 'custom_name_or_pokemon_name';
        level: 'prominent_display';
        grade: 'year_in_school';
        position: 'team_role';
      };
      
      statsPreview: {
        overall: 'total_power_indicator';
        strengths: 'top_2_stats_highlighted';
        condition: 'color_coded_indicator';
        fatigue: 'visual_gauge';
      };
      
      quickActions: [
        { action: 'individual_training', icon: 'dumbbell' },
        { action: 'rest_assignment', icon: 'bed' },
        { action: 'detailed_view', icon: 'eye' },
        { action: 'formation_assignment', icon: 'formation' }
      ];
    };
  };
  
  detailModal: {
    tabStructure: {
      overview: 'basic_info_and_current_stats';
      stats: 'detailed_abilities_with_charts';
      moves: 'learned_techniques_and_special_moves';
      history: 'growth_record_and_match_history';
      training: 'personalized_training_recommendations';
    };
    
    statVisualizations: {
      radarChart: 'pentagon_showing_5_main_stats';
      progressBars: 'individual_stat_progress';
      growthGraph: 'historical_development_chart';
      comparison: 'vs_team_average_indicators';
    };
  };
}
```

### 3.3 練習・トレーニング画面
```typescript
interface TrainingUI {
  planningPhase: {
    calendarView: {
      weeklySchedule: 'drag_and_drop_training_assignment';
      dailySlots: 'morning_afternoon_evening_availability';
      conflictDetection: 'overlapping_activities_warning';
      weatherIntegration: 'optimal_training_day_suggestions';
    };
    
    trainingMenuSelector: {
      categories: {
        basic: ['power', 'technique', 'speed', 'stamina', 'mental'];
        specialized: ['serve', 'volley', 'stroke', 'return'];
        tactical: ['singles', 'doubles', 'game_analysis'];
        special: ['team_building', 'mental_coaching', 'recovery'];
      };
      
      participantSelection: {
        multiSelect: 'checkbox_based_player_selection';
        presets: ['all_team', 'starters_only', 'by_grade', 'custom'];
        capacity: 'training_facility_limitations';
        recommendations: 'ai_suggested_participants';
      };
    };
  };
  
  executionPhase: {
    progressVisualization: {
      overallProgress: 'animated_progress_circle';
      individualResults: 'real_time_stat_changes';
      specialEvents: 'popup_notifications_for_breakthroughs';
      efficiencyMeters: 'facility_and_weather_bonuses';
    };
    
    interactiveElements: {
      skipOption: 'fast_forward_with_summary';
      pauseOption: 'interrupt_for_emergency_decisions';
      focusMode: 'zoom_in_on_specific_player';
      eventChoices: 'decision_prompts_during_training';
    };
    
    resultsSummary: {
      statsGained: 'before_after_comparison';
      experienceEarned: 'level_progress_updates';
      specialOutcomes: 'new_moves_or_evolution_triggers';
      teamMorale: 'group_motivation_changes';
      fatigue: 'energy_level_updates';
    };
  };
}
```

### 3.4 試合システムUI
```typescript
interface MatchUI {
  preparation: {
    opponentAnalysis: {
      schoolInfo: 'name_reputation_and_facilities';
      teamComposition: 'player_types_and_strengths';
      historical: 'previous_match_results_if_any';
      weaknesses: 'strategic_opportunities';
    };
    
    formationEditor: {
      singles: {
        order: 'S1_S2_S3_drag_and_drop_assignment';
        substitutes: 'backup_player_selection';
        strategy: 'aggressive_defensive_balanced_presets';
      };
      
      doubles: {
        pairs: 'D1_D2_partner_combinations';
        chemistry: 'compatibility_indicators';
        formation: 'net_baseline_positioning_tactics';
      };
      
      teamStrategy: {
        overall: 'risk_level_and_approach';
        courtPreference: 'surface_type_if_selectable';
        weatherConsiderations: 'environmental_adjustments';
      };
    };
  };
  
  liveMatch: {
    scoreboard: {
      teamNames: 'home_vs_away_display';  
      currentScore: 'sets_and_games_prominent';
      matchProgress: 'game_indicator_S1_S2_D1_S3_D2';
      timeElapsed: 'optional_match_duration';
    };
    
    playByPlay: {
      keyMoments: 'important_points_and_shots';
      momentum: 'visual_advantage_indicator';
      playerCondition: 'fatigue_and_performance_tracking';
      specialEvents: 'critical_shots_and_comebacks';
    };
    
    interactionOptions: {
      pacing: ['auto', 'semi_auto', 'step_by_step'];
      focus: 'zoom_in_on_specific_games';
      timeout: 'strategic_pause_options';
      substitution: 'mid_match_player_changes';
    };
  };
  
  postMatch: {
    results: {
      finalScore: 'comprehensive_match_summary';
      mvp: 'standout_player_recognition';
      statistics: 'detailed_performance_metrics';
      experience: 'growth_and_learning_outcomes';
    };
    
    analysis: {
      keyMoments: 'replay_of_critical_points';
      playerGrowth: 'stat_improvements_from_match';
      lessons: 'areas_for_improvement_identified';
      nextSteps: 'recommended_follow_up_training';
    };
  };
}
```

### 3.5 設備・施設管理UI
```typescript
interface FacilitiesUI {
  overview: {
    facilityMap: {
      visualLayout: 'isometric_3d_school_grounds';
      interactiveElements: 'clickable_buildings_and_courts';
      statusIndicators: 'condition_and_usage_levels';
      expansionOptions: 'available_upgrade_paths';
    };
    
    maintenanceSchedule: {
      upcomingTasks: 'required_maintenance_timeline';
      costEstimates: 'budget_planning_information';
      priorityLevels: 'urgent_important_optional_classifications';
      automaticScheduling: 'ai_optimized_maintenance_planning';
    };
  };
  
  detailView: {
    courtManagement: {
      condition: 'detailed_wear_and_tear_assessment';
      surface: 'hard_clay_grass_indoor_specifications';
      usage: 'practice_match_availability_scheduling';
      weather: 'outdoor_indoor_considerations';
    };
    
    equipmentInventory: {
      categories: ['training_machines', 'balls_and_rackets', 'medical_supplies'];
      condition: 'durability_and_replacement_schedules';
      utilization: 'usage_patterns_and_efficiency';
      procurement: 'purchase_recommendations_and_budgeting';
    };
    
    buildingUpgrades: {
      clubhouse: 'size_amenities_and_team_bonuses';
      medical: 'injury_prevention_and_recovery_facilities';
      analysis: 'video_and_data_analysis_equipment';
      storage: 'equipment_organization_and_preservation';
    };
  };
  
  budgetPlanning: {
    allocation: {
      categories: 'maintenance_upgrades_new_purchases';
      timeline: 'short_term_and_long_term_investments';
      roi: 'expected_benefits_and_payback_periods';
      scenarios: 'conservative_moderate_aggressive_spending';
    };
    
    funding: {
      sources: 'school_budget_tournaments_sponsorships';
      projections: 'income_forecasting_based_on_performance';
      constraints: 'mandatory_expenses_and_minimum_reserves';
      opportunities: 'grant_applications_and_fundraising';
    };
  };
}
```

## 4. インタラクションパターン

### 4.1 基本操作パターン
```typescript
interface InteractionPatterns {
  navigation: {
    primaryNavigation: {
      type: 'persistent_sidebar';
      behavior: 'collapsible_on_mobile';
      keyboardShortcuts: {
        'D': 'dashboard',
        'T': 'team_management', 
        'R': 'training',
        'M': 'matches',
        'F': 'facilities',
        'S': 'story',
        'L': 'rankings'
      };
    };
    
    breadcrumbs: {
      style: 'home > team > player_detail';
      interactivity: 'clickable_navigation_path';
      context: 'shows_current_location_in_app';
    };
    
    tabs: {
      usage: 'secondary_navigation_within_sections';
      persistence: 'remember_last_active_tab';
      keyboard: 'arrow_keys_for_tab_switching';
    };
  };
  
  dataEntry: {
    forms: {
      validation: 'real_time_field_validation';
      feedback: 'inline_error_messages';
      autosave: 'automatic_draft_saving';
      shortcuts: 'tab_enter_navigation';
    };
    
    dragAndDrop: {
      usage: ['team_formation', 'training_schedule', 'facility_layout'];
      feedback: 'visual_drop_zones_and_hover_states';
      constraints: 'valid_drop_target_highlighting';
      undo: 'single_action_undo_redo';
    };
    
    selectors: {
      multiSelect: 'checkbox_with_select_all_option';
      singleSelect: 'radio_buttons_or_dropdown';
      quickFilters: 'tag_based_filtering_interface';
      search: 'real_time_search_with_suggestions';
    };
  };
  
  feedback: {
    loading: {
      indicators: 'contextual_progress_spinners';
      states: 'skeleton_screens_for_content_loading';
      timeout: 'graceful_degradation_after_30_seconds';
    };
    
    notifications: {
      success: 'brief_confirmation_messages';
      warnings: 'actionable_caution_alerts';
      errors: 'clear_problem_explanation_with_solutions';
      info: 'helpful_contextual_information';
    };
    
    confirmation: {
      destructive: 'explicit_confirmation_for_deletions';
      important: 'summary_of_consequences_before_action';
      routine: 'single_click_with_undo_option';
    };
  };
}
```

### 4.2 ゲーム特有のインタラクション
```typescript
interface GameSpecificInteractions {
  timeControl: {
    playPause: {
      trigger: 'spacebar_or_large_central_button';
      states: ['paused', 'normal_speed', 'fast_forward'];
      visual: 'play_pause_fast_forward_icons';
    };
    
    speedControl: {
      options: ['1x', '2x', '4x', 'instant'];
      keyboard: 'number_keys_1_2_3_4';
      mouse: 'click_or_scroll_wheel';
    };
    
    calendar: {
      navigation: 'month_week_day_views';
      eventPlacement: 'drag_drop_scheduling';
      timeTravel: 'quick_jump_to_specific_dates';
    };
  };
  
  playerInteraction: {
    selection: {
      single: 'click_to_select';
      multiple: 'ctrl_click_or_shift_click';
      all: 'ctrl_a_or_select_all_button';
      filters: 'predefined_selection_criteria';
    };
    
    actions: {
      contextMenu: 'right_click_for_player_specific_actions';
      quickActions: 'hover_buttons_for_common_tasks';
      bulkActions: 'toolbar_appears_when_multiple_selected';
      shortcuts: 'hotkeys_for_frequent_operations';
    };
    
    comparison: {
      sideBySide: 'detailed_stat_comparison_view';
      overlay: 'tooltip_comparison_on_hover';
      highlight: 'visual_emphasis_of_differences';
    };
  };
  
  progression: {
    statGrowth: {
      animation: 'smooth_bar_fill_animations';
      comparison: 'before_after_value_highlighting';
      celebration: 'milestone_achievement_effects';
    };
    
    levelUp: {
      notification: 'prominent_level_up_announcement';
      rewards: 'new_abilities_or_unlocks_showcase';
      choices: 'evolution_or_development_path_selection';
    };
    
    achievements: {
      unlock: 'satisfying_achievement_popup';
      progress: 'partial_completion_indicators';
      showcase: 'achievement_gallery_with_descriptions';
    };
  };
}
```

## 5. アクセシビリティ対応

### 5.1 視覚的アクセシビリティ
```typescript
interface VisualAccessibility {
  colorAndContrast: {
    compliance: 'WCAG_2.1_AA_standards';
    colorBlindness: {
      alternatives: 'pattern_and_texture_in_addition_to_color';
      simulation: 'design_tested_with_colorblind_simulators';
      options: 'high_contrast_and_alternative_color_schemes';
    };
    
    contrast: {
      text: 'minimum_4_5_1_ratio_for_normal_text';
      largeText: 'minimum_3_1_ratio_for_large_text';
      interactive: 'minimum_3_1_ratio_for_ui_components';
    };
  };
  
  typography: {
    scalability: {
      support: 'browser_zoom_up_to_200_percent';
      responsive: 'text_reflows_without_horizontal_scrolling';
      minimum: '16px_base_font_size';
    };
    
    readability: {
      fonts: 'clear_legible_font_families';
      spacing: 'adequate_line_height_and_letter_spacing';
      hierarchy: 'clear_heading_structure_h1_h6';
    };
  };
  
  visualIndicators: {
    focus: 'clear_keyboard_focus_indicators';
    states: 'disabled_selected_active_state_styling';
    progress: 'visual_progress_indicators_for_processes';
  };
}
```

### 5.2 キーボード・操作アクセシビリティ
```typescript
interface OperationalAccessibility {
  keyboard: {
    navigation: {
      tabOrder: 'logical_tab_sequence_through_interface';
      shortcuts: 'consistent_keyboard_shortcuts_throughout';
      escape: 'escape_key_closes_modals_and_dropdowns';
      focus: 'visible_focus_indicators_at_all_times';
    };
    
    interaction: {
      activation: 'enter_and_space_activate_buttons';
      selection: 'arrow_keys_navigate_within_components';
      modification: 'standard_editing_shortcuts_supported';
    };
  };
  
  touchAndMouse: {
    targets: {
      size: 'minimum_44px_touch_targets';
      spacing: 'adequate_space_between_interactive_elements';
      precision: 'forgiving_touch_areas_around_small_elements';
    };
    
    gestures: {
      alternatives: 'button_alternatives_for_complex_gestures';
      simple: 'primary_interactions_use_simple_gestures';
      customizable: 'gesture_sensitivity_adjustments';
    };
  };
  
  timing: {
    extended: 'generous_time_limits_for_user_actions';
    warning: 'advance_warning_before_timeouts';
    pause: 'ability_to_pause_or_extend_time_limits';
  };
}
```

### 5.3 認知的アクセシビリティ
```typescript
interface CognitiveAccessibility {
  simplicity: {
    language: 'clear_simple_language_throughout';
    instructions: 'step_by_step_guidance_for_complex_tasks';
    consistency: 'consistent_terminology_and_patterns';
  };
  
  navigation: {
    orientation: 'clear_indication_of_current_location';
    breadcrumbs: 'navigation_path_always_visible';
    search: 'powerful_search_functionality_available';
  };
  
  errorPrevention: {
    validation: 'real_time_input_validation_and_feedback';
    confirmation: 'confirmation_steps_for_important_actions';
    undo: 'easy_undo_functionality_for_reversible_actions';
  };
  
  help: {
    contextual: 'relevant_help_information_where_needed';
    comprehensive: 'detailed_help_documentation_available';
    multiple: 'various_help_formats_text_video_interactive';
  };
}
```

## 6. パフォーマンス・レスポンシブ設計

### 6.1 パフォーマンス最適化
```typescript
interface PerformanceOptimization {
  loading: {
    critical: 'above_fold_content_loads_under_1_second';
    progressive: 'non_critical_content_loads_progressively';
    lazy: 'images_and_heavy_content_lazy_loaded';
    preload: 'anticipated_user_actions_preloaded';
  };
  
  rendering: {
    virtualization: 'large_lists_use_virtual_scrolling';
    optimization: 'react_memo_and_callback_optimization';
    batching: 'state_updates_batched_for_efficiency';
    caching: 'component_and_data_caching_strategies';
  };
  
  network: {
    compression: 'gzip_and_brotli_compression_enabled';
    cdn: 'static_assets_served_from_cdn';
    caching: 'appropriate_cache_headers_set';
    bundling: 'optimized_javascript_and_css_bundles';
  };
}
```

### 6.2 レスポンシブデザイン詳細
```typescript
interface ResponsiveDesign {
  breakpoints: {
    mobile: {
      range: '320px_to_768px';
      layout: 'single_column_stack';
      navigation: 'hamburger_menu_with_bottom_tabs';
      interactions: 'touch_optimized_controls';
    };
    
    tablet: {
      range: '769px_to_1024px';
      layout: 'two_column_with_collapsible_sidebar';
      navigation: 'persistent_sidebar_with_icons';
      interactions: 'hybrid_touch_and_mouse_support';
    };
    
    desktop: {
      range: '1025px_and_above';
      layout: 'three_column_full_interface';
      navigation: 'full_sidebar_with_labels';
      interactions: 'keyboard_shortcuts_and_hover_states';
    };
  };
  
  adaptiveContent: {
    text: 'readable_font_sizes_at_all_breakpoints';
    images: 'responsive_images_with_appropriate_sizing';
    spacing: 'proportional_spacing_that_scales_appropriately';
    interaction: 'appropriately_sized_touch_targets';
  };
  
  progressiveEnhancement: {
    core: 'basic_functionality_works_without_javascript';
    enhanced: 'full_features_available_with_javascript';
    graceful: 'graceful_degradation_for_older_browsers';
  };
}
```

## 7. アニメーション・モーション設計

### 7.1 アニメーション原則
```typescript
interface AnimationPrinciples {
  purpose: {
    feedback: 'confirm_user_actions_with_subtle_animations';
    guidance: 'direct_attention_to_important_elements';
    continuity: 'maintain_spatial_relationships_during_transitions';
    personality: 'add_character_without_overwhelming_functionality';
  };
  
  timing: {
    duration: {
      micro: '100_200ms_for_simple_state_changes';
      short: '200_500ms_for_element_transitions';  
      medium: '500_800ms_for_complex_animations';
      long: '800_1200ms_for_major_scene_changes';
    };
    
    easing: {
      ease_out: 'elements_entering_the_screen';
      ease_in: 'elements_leaving_the_screen';
      ease_in_out: 'elements_moving_within_screen';
      spring: 'playful_bouncy_interactions';
    };
  };
  
  preferences: {
    reduced_motion: 'respect_prefers_reduced_motion_setting';
    alternatives: 'provide_instant_alternatives_when_requested';
    controls: 'allow_users_to_disable_animations';
  };
}
```

### 7.2 具体的アニメーション実装
```typescript
interface SpecificAnimations {
  gameElements: {
    statBars: {
      growth: 'smooth_bar_fill_with_number_counting';
      comparison: 'side_by_side_animated_comparison';
      achievement: 'celebratory_bar_complete_animation';
    };
    
    pokemonSprites: {
      idle: 'subtle_breathing_or_floating_animation';
      interaction: 'response_to_clicks_and_selections';
      evolution: 'dramatic_transformation_sequence';
      level_up: 'glow_and_particle_effects';
    };
    
    matches: {
      score_update: 'scoreboard_number_flip_animation';
      critical_moment: 'screen_shake_or_zoom_effects';
      victory: 'confetti_and_celebration_animations';
    };
  };
  
  interface: {
    navigation: {
      page_transitions: 'smooth_slide_or_fade_between_sections';
      modal_appearance: 'scale_up_from_trigger_element';
      tab_switching: 'content_slide_with_active_indicator';
    };
    
    feedback: {
      button_press: 'subtle_scale_down_on_activation';
      loading: 'spinner_or_skeleton_loading_states';
      success: 'checkmark_draw_in_animation';
      error: 'gentle_shake_to_indicate_problem';
    };
    
    data: {
      list_updates: 'new_items_slide_in_from_appropriate_direction';
      sorting: 'smooth_reordering_with_maintained_context';
      filtering: 'fade_out_hidden_items_fade_in_visible';
    };
  };
}
```

## 8. デザインガイドライン・スタイルガイド

### 8.1 コンポーネントライブラリ
```typescript
interface ComponentLibrary {
  buttons: {
    primary: {
      style: 'filled_background_with_contrasting_text';
      states: ['default', 'hover', 'active', 'disabled', 'loading'];
      sizes: ['sm', 'md', 'lg'];
      usage: 'main_call_to_action_buttons';
    };
    
    secondary: {
      style: 'outlined_border_with_transparent_background';
      usage: 'secondary_actions_and_alternatives';
    };
    
    ghost: {
      style: 'text_only_with_subtle_hover_background';
      usage: 'tertiary_actions_and_navigation';
    };
  };
  
  cards: {
    player_card: {
      layout: 'header_with_avatar_stats_section_action_footer';
      elevation: 'subtle_shadow_with_hover_lift_effect';
      variants: ['compact', 'detailed', 'comparison'];
    };
    
    info_card: {
      layout: 'icon_title_description_optional_actions';
      usage: 'facility_status_notifications_achievements';
    };
  };
  
  forms: {
    inputs: {
      text: 'consistent_border_focus_states_label_positioning';
      select: 'dropdown_with_search_and_multi_select_options';
      checkbox: 'custom_styled_with_indeterminate_state';
      radio: 'grouped_options_with_clear_selection_indicator';
    };
    
    validation: {
      inline: 'real_time_validation_with_helpful_messages';
      summary: 'form_level_error_summary_when_needed';
      success: 'confirmation_of_successful_submissions';
    };
  };
}
```

### 8.2 アイコンシステム
```typescript
interface IconSystem {
  library: 'lucide_react_with_custom_pokemon_tennis_icons';
  
  categories: {
    navigation: ['home', 'team', 'training', 'matches', 'facilities', 'rankings'];
    actions: ['edit', 'delete', 'save', 'cancel', 'search', 'filter', 'sort'];
    status: ['success', 'warning', 'error', 'info', 'loading', 'completed'];
    game: ['pokemon_types', 'tennis_equipment', 'weather', 'courts', 'trophies'];
  };
  
  specifications: {
    sizes: ['16px', '20px', '24px', '32px', '48px'];
    style: 'outline_icons_for_consistency';
    color: 'inherit_from_parent_or_semantic_colors';
    accessibility: 'meaningful_alt_text_and_aria_labels';
  };
  
  usage: {
    buttons: 'paired_with_text_labels_where_possible';
    navigation: 'consistent_icons_across_similar_functions';
    status: 'color_coded_with_text_alternatives';
  };
}
```

## 9. 実装優先度・フェーズ分け

### 9.1 Phase 1: Core UI (MVP)
```typescript
interface Phase1Implementation {
  priority: 'highest';
  timeline: '4_weeks';
  
  components: [
    'basic_layout_structure',
    'navigation_system',
    'main_dashboard',
    'team_management_basic',
    'training_execution_simple',
    'match_results_display',
    'mobile_responsive_layout'
  ];
  
  features: [
    'core_game_functionality_ui',
    'basic_responsive_design',
    'essential_accessibility_features',
    'fundamental_animations'
  ];
}
```

### 9.2 Phase 2: Enhanced UX
```typescript
interface Phase2Implementation {
  priority: 'high';
  timeline: '3_weeks';
  
  components: [
    'advanced_filtering_and_sorting',
    'detailed_statistics_visualization',
    'comprehensive_settings_panel',
    'help_and_tutorial_system',
    'notification_system',
    'advanced_animations'
  ];
  
  features: [
    'complete_accessibility_compliance',
    'advanced_responsive_features',
    'performance_optimizations',
    'user_preference_customization'
  ];
}
```

### 9.3 Phase 3: Polish & Optimization
```typescript
interface Phase3Implementation {
  priority: 'medium';
  timeline: '2_weeks';
  
  components: [
    'micro_interactions_polish',
    'advanced_data_visualizations',
    'customizable_dashboard',
    'accessibility_enhancements',
    'dark_mode_support'
  ];
  
  features: [
    'performance_monitoring_integration',
    'advanced_personalization',
    'internationalization_ready_ui',
    'comprehensive_testing_coverage'
  ];
}
```

---

この詳細なUI/UX設計により、ユーザーが直感的に操作でき、長時間プレイしても疲れない、美しく機能的なインターフェースを提供します。ポケモンの親しみやすさとテニスの戦略性を両立した、魅力的なゲーム体験を実現します。