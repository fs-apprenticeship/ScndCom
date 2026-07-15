class CreateDraftAction {

}

class Draft {
    id string
    message Message
}

function CreateDraft(text: string) -> Draft {
    client "CustomGPT5Mini"
    prompt #"
        Create a draft in Gmail with the following details:
        {{ text }}

        {{ ctx.output_format }}
    "#
}

test new_draft {
    functions [CreateDraft]
    args {
        text #"
            Subject: Meeting Reminder

            Hi Team,

            Just a reminder about our meeting scheduled for tomorrow at 10 AM. Please let me know if you have any questions or if you need to reschedule.

            Best,
            Frank
        "#
    }
}

class Message {
    id string
    threadId string
    labelIds string[]
    snippet string
    historyId string
    internalDate string
    payload MessagePart
    sizeEstimate int
    raw string
    classificationLabelValues ClassificationLabelValue
}

class MessagePart {
    partId string
    mimeType string
    filename string
    headers MessagePartHeader[]
    body MessagePartBody
    parts MessagePart[]
}

class MessagePartBody {
    size int
    data string
    attachmentId string
}

class MessagePartHeader {
    name string
    value string
}

class ClassificationLabelValue {
    labelId string
    fields ClassificationLabelFeildValue[]
}

class ClassificationLabelFeildValue {
    fieldId string
    selection string
}