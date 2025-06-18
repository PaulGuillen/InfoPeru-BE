const Util = require("../utils/util");

function ImageResolution(data = {}) {
  return {
    y: data.y || 0,
    x: data.x || 0,
    u: data.u || "",
  };
}

function MediaMetaData(data = {}) {
  return {
    status: data.status || "",
    e: data.e || "",
    m: data.m || "",
    p: Array.isArray(data.p) ? data.p.map((p) => ImageResolution(p)) : [],
    s: data.s ? ImageResolution(data.s) : null,
    id: data.id || "",
  };
}

function MediaEmbed(data = {}) {
  return {
    content: data.content || "",
    width: data.width || 0,
    height: data.height || 0,
  };
}

function PostData(data = {}) {
  return {
    id: data.id || "",
    title: data.title || "",
    author: data.author || "",
    subreddit: data.subreddit || "",
    selfText:
      (data.selftext && data.selftext.trim().length > 0
        ? data.selftext
        : "No hay texto disponible") + " ...Leer más?",
    url: data.url || "",
    thumbnail: data.thumbnail || "",
    createdUtc: data.created_utc || 0,
    createdAt: Util.formatFromUnix(data.created_utc || 0),
    numComments: data.num_comments || 0,
    ups: data.ups || 0,
    permalink: `https://reddit.com${data.permalink || ""}`,
    isVideo: data.is_video || false,
    approvedAtUtc: data.approved_at_utc || null,
    authorFullname: data.author_fullname || "",
    saved: data.saved || false,
    modReasonTitle: data.mod_reason_title || null,
    clicked: data.clicked || false,
    subredditNamePrefixed: data.subreddit_name_prefixed || "",
    hidden: data.hidden || false,
    pwls: data.pwls || 0,
    linkFlairCssClass: data.link_flair_css_class || "",
    thumbnailHeight: data.thumbnail_height || 0,
    topAwardedType: data.top_awarded_type || "",
    hideScore: data.hide_score || false,
    name: data.name || "",
    quarantine: data.quarantine || false,
    linkFlairTextColor: data.link_flair_text_color || "",
    upvoteRatio: data.upvote_ratio || 0.0,
    authorFlairBackgroundColor: data.author_flair_background_color || "",
    subredditType: data.subreddit_type || "",
    totalAwardsReceived: data.total_awards_received || 0,
    thumbnailWidth: data.thumbnail_width || 0,
    authorFlairTemplateId: data.author_flair_template_id || "",
    isOriginalContent: data.is_original_content || false,
    userReports: data.user_reports || [],
    secureMedia: data.secure_media ? new MediaEmbed(data.secure_media) : null,
    isRedditMediaDomain: data.is_reddit_media_domain || false,
    isMeta: data.is_meta || false,
    category: data.category || "",
    linkFlairText: data.link_flair_text || "",
    canModPost: data.can_mod_post || false,
    score: data.score || 0,
    approvedBy: data.approved_by || "",
    edited: data.edited || null,
    authorFlairCssClass: data.author_flair_css_class || "",
    authorFlairRichtext: data.author_flair_richtext || [],
    gildings: data.gildings || {},
    contentCategories: data.content_categories || {},
    isSelf: data.is_self || false,
    modNote: data.mod_note || "",
    created: data.created || 0.0,
    linkFlairType: data.link_flair_type || "",
    wls: data.wls || 0,
    removedByCategory: data.removed_by_category || "",
    bannedBy: data.banned_by || "",
    authorFlairType: data.author_flair_type || "",
    domain: data.domain || "",
    allowLiveComments: data.allow_live_comments || false,
    selftextHtml: data.selftext_html || "",
    likes: data.likes || null,
    suggestedSort: data.suggested_sort || "",
    bannedAtUtc: data.banned_at_utc || "",
    viewCount: data.view_count || 0,
    archived: data.archived || false,
    noFollow: data.no_follow || false,
    isCrosspostable: data.is_crosspostable || false,
    pinned: data.pinned || false,
    over18: data.over_18 || false,
    mediaMetadata: data.media_metadata
      ? MediaMetaData(data.media_metadata)
      : null,
    allAwardings: data.all_awardings || [],
    awarders: data.awarders || [],
    mediaOnly: data.media_only || false,
    canGild: data.can_gild || false,
    spoiler: data.spoiler || false,
    locked: data.locked || false,
    authorFlairText: data.author_flair_text || "",
    treatmentTags: data.treatment_tags || [],
    visited: data.visited || false,
    removedBy: data.removed_by || "",
    numReports: data.num_reports || 0,
    distinguished: data.distinguished || "",
    subredditId: data.subreddit_id || "",
    authorIsBlocked: data.author_is_blocked || false,
    modReasonBy: data.mod_reason_by || "",
    removalReason: data.removal_reason || "",
    linkFlairBackgroundColor: data.link_flair_background_color || "",
    isRobotIndexable: data.is_robot_indexable || false,
    reportReasons: data.report_reasons || {},
    discussionType: data.discussion_type || null,
    sendReplies: data.send_replies || false,
    whitelistStatus: data.whitelist_status || "",
    contestMode: data.contest_mode || false,
    modReports: data.mod_reports || [],
    authorPatreonFlair: data.author_patreon_flair || false,
    authorFlairTextColor: data.author_flair_text_color || "",
    parentWhitelistStatus: data.parent_whitelist_status || "",
    stickied: data.stickied || false,
    numCrossposts: data.num_crossposts || 0,
    media: data.media ? new MediaEmbed(data.media) : null,
  };
}

function RedditResponse(raw = {}) {
  return {
    kind: raw.kind || "",
    data: {
      after: raw.data?.after || "",
      dist: raw.data?.dist || 0,
      modhash: raw.data?.modhash || "",
      geoFilter: raw.data?.geo_filter || "",
      before: raw.data?.before || "",
      children: Array.isArray(raw.data?.children)
        ? raw.data.children.map((child) => PostData(child.data))
        : [],
    },
  };
}

module.exports = RedditResponse;
